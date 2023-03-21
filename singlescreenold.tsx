import * as angular from 'angular';
import _ from 'lodash';
import 'angular-animate';
import React, { Fragment, ReactElement } from 'react';
import ReactDOM from 'react-dom';
import { createWindow } from '../../Services/NonAngular/IPC';
import {
    ChangeTab,
    FeedNameInfo,
    UserWorkspaceSetting,
    UserScreenSetting,
    CrossReferenceCreate,
    CrossReferenceCancel,
    Screen,
    SetUserWorkspaceSetting
} from '../../MessagesTs/MessageDefinitions';
import {
    Layout,
    LayoutTab,
    LayoutTabColumn,
    LayoutTabRow,
    LayoutView,
    Workspace
} from '../../MessagesTs/ServicesMessageDefinitions';
import { IUnitService } from '../../Services/IUnitService';
import { IEventService } from '../../Services/IEventService';
import { IInterfaceService } from '../../Services/IInterfaceService';
import { ICrossReferenceEventsService } from '../../Services/NonAngular/CrossReferenceEventsService';
import {
    stripOuterSingleQuotes,
    toInjectableJson,
    getUrlParams,
    encodeSpecialChars
} from '../../Services/NonAngular/TextFormat';
import {
    setLocalStorageItem,
    setCrossProductLocalStorageItem,
    deleteLocalStorageItem,
    getCrossProductLocalStorageItem,
    getLocalStorageItem
} from '../../Services/NonAngular/LocalStorage';
import { Component } from '../Helpers';
import * as LayoutDefaults from '../../Entities/Map/LayoutDefaults';
import {
    needStrings,
    getString,
    getStrings,
    getIfNotLocalized
} from '../../Services/NonAngular/LocalizedStrings';
import { sendCommand } from '../../Services/NonAngular/Commands';
import * as StateService from '../../Services/NonAngular/StateService';
import { createSingletonWindow, closeAllWindows } from '../../Services/NonAngular/IPC';
import { registerCmdKeyProvider, z_index } from '../../Services/NonAngular/DialogService';
import { Deferred, IDeferred } from '../../Libraries/Deferred';
import { getParameterFromTable, getWatermarkText } from '../../Services/NonAngular/Config';
import { DockDirection } from '../DockedViewSetting';
import { openHelp, openAddOnHelp } from '../../Services/NonAngular/StateService';
import { getCookie } from '../../Services/NonAngular/Cookies';
import { NotificationType } from '../../Entities/Enums/NotificationType';
import { SystemNotificationType } from '../../Entities/Enums/SystemNotificationType';
import { getParameterFromList } from '../../Services/NonAngular/Config';
import {
    processCommand,
    processCommandKey,
    canRunCommandKey
} from '../../Services/NonAngular/CommandLineService';
import { SendMessage } from '../../MessagesTs/ServicesMessageDefinitions';
import {
    initLayoutService,
    getSharedLayouts,
    getSharedTabs,
    getStandardViews,
    getUserDefinedViews,
    userWorkspaceSettingsAreValid,
    userWorkspaceSettingsAvailableToCurrentUserGroup,
    getAllWorkspacesForUser,
    saveUserWorkspaceSettings,
    getUniqueViewsInTab,
    getDockedView,
    getRowFixedHeight,
    registerSetTabDisabledCallback,
    unregisterSetTabDisabledCallback,
    getSiteWorkspaces,
    getAddonViews,
    setWindowInformation,
    setActiveTab,
    setActiveTabs,
    tabListHasViewWithKey,
    setActiveWorkspace,
    setActiveLayout,
    onTabSwitch,
    getUnDockedView,
    setScreenActiveTabMap,
    clearScreenActiveTapMap,
    registerWorkspaceChangedCallback,
    unregisterWorkspaceChangedCallback,
    saveTabs,
    saveLayouts,
    saveWorkspaces
} from '../../Services/NonAngular/LayoutService';
import { setTheme } from '../../Services/NonAngular/ThemeService';

import {
    registerForSummaryChanges,
    changeTabToBroadcast
} from '../../Services/NonAngular/BroadcastService';
import { IBroadcastSummaryItem } from '../Broadcast/BroadcastInterfaces';
import { useServices } from '../../Hooks/useServices';
import { ICacheChangeArgs, IUnitCacheItem, IEventCacheItem } from '../../Services/Hubs';
import {
    submitNotification,
    initNotifications,
    subscribeToSystemUpgradedCallback,
    unsubscribeFromSystemUpgradedCallback
} from '../../Services/NonAngular/NotificationService';
import { IFeedService } from '../../Services/NonAngular/Interfaces/IFeedService';
import { IDashboardService } from '../../Services/IDashboardService';
import { ICustomizationService } from '../../Services/ICustomizationService';
import { IDialogCommandRequest, ICommandResult } from '../../Services/IDialogService';
import { SingleScreenTab } from '../../Entities/Layout/SingleScreenTab';
import { ScreenActiveTab } from '../../Entities/Layout/ScreenActiveTab';
import { CustomPopupWindow } from '../../Entities/Layout/CustomPopupWindow';
import { IConfirmDispatchMessage } from '../../Entities/Interfaces/Message/IConfirmDispatchMessage';
import { ChangeWorkspaceErrorType } from '../../Entities/Enums/ChangeWorkspaceErrorType';
import { OrderedCellRow } from '../../Entities/Layout/OrderedCellRow';
import { SavedStateTypes } from '../../Entities/Enums/SavedStateTypes';
import {
    sopPanelToggled,
    contactsPanelToggled,
    IPanelManagerState,
    registerAnimationCompleteCallback,
    unregisterAnimationCompleteCallback
} from '../PanelManagerEntities';
import {
    initializeChatServerConnection,
    isRocketChatEnabled,
    registerForChatUnReadMessages,
    unregisterForChatUnReadMessages
} from '../../Services/NonAngular/RocketChat/RocketChatService';
import {
    registerPreemptModalCallback,
    unregisterPreemptModalCallback
} from '../../Services/NonAngular/PreemptUtility';
import { registerForShowDialog } from '../../Services/NonAngular/ProQAService';
import { Subscription } from 'rxjs';
import * as Msg from '../../MessagesTs/MessageDefinitions';
import { IContextAndEllipsisMenuManageService } from '../../Services/NonAngular/Interfaces/IContextAndEllipsisMenuManageService';
import {
    IEventPanelSettings,
    ICalltakerPanelSettings
} from '../../../Standard/Administrator/administratorComponents';
import { putEventPanelSettings } from '../../Services/NonAngular/EventPanelSettingsUtility';
import { putCalltakerPanelSettings } from '../../Services/NonAngular/CalltakerPanelSettingsUtility';
import { areNewUnitEventBoardsEnabled } from '../../Services/NonAngular/FeatureFlags/FeatureGroupServices/NewUnitEventBoardsFeatureGroupService';
import { isOmuPltEnabled } from '../../Services/NonAngular/FeatureFlags/FeatureGroupServices/OmuPltFeatureGroupService';
import {
    getUnreadBroadcastCount,
    getUnreadBroadcastKey,
    setUnreadBroadcasts,
    unreadBroadcastExists
} from '../Broadcast/BroadcastUnread';
import {
    registerUnitExchangeModalCallback,
    unregisterUnitExchangeModalCallback
} from '../../Services/NonAngular/UnitExchangeUtility';
import { unregisterForWindowUnload } from '../../Services/NonAngular/LeavePrompt';
import { IViewSetting } from '../../Entities/Interfaces/Layout/IViewSetting';
import { isAutoDispatchActive } from '../../Services/NonAngular/AutoDispatchService';

declare let COMPONENTS;
declare const SERVICES: any;
declare const GLOBAL_BASE_URL: string;
declare const BUILD_VERSION: string;
declare const HAS_TOUCH: boolean;
declare const IS_IN_SHELL: boolean;
declare const SCREEN_NUMBER: number;
declare const SHELL_IPC: any;
declare let SELECTED_LAYOUT: Layout.V1_0_0.Layout;
declare let USER_WORKSPACE_SETTINGS: UserWorkspaceSetting.V2_0_0.UserWorkspaceSetting;
declare const IS_MOBILE_UNIT: boolean;
declare const viewLoaded: () => void;
declare const PRODUCT_SHORT_NAME: string;
declare const PWA_MODE: boolean;
declare const IS_RTL: boolean;
declare const IS_SECURITY_GUARDIAN: boolean;

// Mapping of which views are behind a feature flag
const viewFeatureFlagMapping: {
    existingView: string;
    featureFlag: () => Promise<boolean>;
    replacementView: string;
}[] = [
    {
        existingView: 'EVENT_BOARD_WIDGET',
        featureFlag: areNewUnitEventBoardsEnabled,
        replacementView: 'EventBoard2'
    },
    {
        existingView: 'UNIT_BOARD_WIDGET',
        featureFlag: areNewUnitEventBoardsEnabled,
        replacementView: 'UnitBoard2'
    },
    {
        existingView: 'SCHEDULED_EVENTS_VIEW',
        featureFlag: areNewUnitEventBoardsEnabled,
        replacementView: 'ScheduledEventBoard'
    }
];

// Views that are not ready to replace existing views yet,
// but still want to be able to render them if they're included
const onCallPresentationViews: {
    existingView: string;
    featureFlag: () => Promise<boolean>;
    replacementView: string;
}[] = [
    {
        existingView: '',
        featureFlag: areNewUnitEventBoardsEnabled,
        replacementView: 'MapLibreMap'
    },
    {
        existingView: '',
        featureFlag: areNewUnitEventBoardsEnabled,
        replacementView: 'BingMapsMap'
    },
    {
        existingView: '',
        featureFlag: areNewUnitEventBoardsEnabled,
        replacementView: 'PictometryMap'
    }
];

//defines which other docks to close when you open a dock
export enum DockHideType {
    None = 'none', //don't interact with others at all - others can't close this either
    Side = 'side', //close ones that pop up on the same side (left, bottom, and top are equal, and right equals right)
    All = 'all', //close all oher docks
    One = 'one' //close only other docks whose direction equals this direction
}

//which other docks to close for each view key - compared by intersection
const DOCK_HIDE_DIRECTIONS = {
    COMMAND_LINE_VIEW: DockHideType.None,
    SOP_PANEL: DockHideType.Side,
    CUSTOM_FEED_VIEW: DockHideType.All,
    CONTACT_DIRECTORY_MENU: DockHideType.Side,
    EVENT_PANEL: DockHideType.Side,
    UNIT_PANEL: DockHideType.Side,
    NOTIFICATIONS_PANEL: DockHideType.Side,
    AD_HOC_TIMERS_PANEL: DockHideType.Side
};

@Component('main', 'singleScreen', {
    templateUrl: GLOBAL_BASE_URL + 'Partials/singleScreen',
    controllerAs: 'ssc'
})
export class SingleScreen {
    static $inject = [
        '$scope',
        '$compile',
        '$timeout',
        '$location',
        'DashboardService',
        'CustomizationService',
        'BASE_URL'
    ];

    public settings: UserWorkspaceSetting.V2_0_0.UserWorkspaceSetting;
    public activeWorkspace: Workspace.V4_0_0.Workspace;
    private EventService: IEventService;
    public activeScreen: Screen.V4_0_0.Screen;
    public activeLayout: Layout.V1_0_0.Layout;
    public activeTab: LayoutTab.V2_0_0.LayoutTab;
    private activeTabs: LayoutTab.V2_0_0.LayoutTab[];
    public allWorkspaces: Workspace.V4_0_0.Workspace[] = [];
    public workspaces: Workspace.V4_0_0.Workspace[] = [];
    public layouts: Layout.V1_0_0.Layout[] = [];
    public tabs: LayoutTab.V2_0_0.LayoutTab[] = [];
    public views: LayoutView.V2_0_0.LayoutView[] = [];
    public hasTouch: boolean = HAS_TOUCH;
    public isCommandLineReady: boolean = false;
    public isLoadingTab: boolean = true;
    public isShowingSideMenu: boolean = false;
    public isShowingLayoutManager: boolean = false;
    public isShowingCommandLine: boolean = false;
    public isTransitioningSideMenu: boolean = false;
    public isShowingWatermark: boolean = false;
    public watermarkText: string;
    public savedActiveTab: SingleScreenTab;
    public lastTabs: { [layoutId: string]: SingleScreenTab } = {};
    public dockedViews: LayoutView.V2_0_0.LayoutView[] = [];
    public activeDockedViews: LayoutView.V2_0_0.LayoutView[] = [];
    public showConfirmationModal: boolean = false;
    public confirmText: string;
    public confirmationPromise: ng.IDeferred<void>;
    private urlParams: { [key: string]: string } = {};
    private arrayArgs: any[] = [];
    public availableFeeds: FeedNameInfo.V1_0_0.FeedNameInfo[] = [];
    public configurableFeedType: string = 'CustomFeed~~';
    public willOpenNewTabsPrompt: string;
    public showWillOpenNewTabsModal: boolean = false;
    public offerToOpenOtherTabs: boolean = !localStorage.getItem('reload-all-simple-windows');
    public openOtherTabs: boolean = !localStorage.getItem('reload-all-simple-windows');
    public workspaceWindowsToOpen: string[] = [];
    public menuNotificationCount: number = 0;
    public notificationsSnoozed: boolean = false;
    public isOpenHelp: boolean = false;
    private reactElements: { element: ReactElement<any>; guid: string }[] = [];
    private FeedService: IFeedService = useServices().FeedService;
    private UnitService: IUnitService;
    private unitId: string; // Mobile Unit Id
    private myEventTabName: string = 'DEFAULT_TAB_OMU_MY_EVENT';
    private myEventTabNameDefault: string = 'DEFAULT_TAB_OMU_MY_EVENT';
    private myPatrolTabName: string = 'DEFAULT_TAB_OMU_PATROL';
    private selectedEventViewName: string = 'SELECTED_EVENTS_VIEW';
    private patrolViewName: string = 'OMU_PATROL';
    private disabledTabNames: string[] = []; // Disabled Tab Names
    private isAnimatingDock: boolean = false;
    public customPopupWindow: CustomPopupWindow = null;
    public showPopupWindow: boolean = false;
    public dockBadgeNumbers: { [key: string]: number } = {};
    public dockIconStyles: { [key: string]: string } = {};
    public dockKeyboardShortcuts: { [key: string]: string[] } = {};
    public pressedKeys: string[] = [];
    public newKeyPress: boolean = true;
    public addOnHelpFiles: { displayName: string; fileName: string }[] = [];
    public noAvailableWorkspaces = false;
    public noAvailableWorkspacesMsg = '';
    public showContactDirectoryIcon: boolean = false;
    public isAddNewContactOpen: boolean = false;
    public isEditPersonContactOpen: boolean = false;
    public isEditPlaceContactOpen: boolean = false;
    public isProqaMultiDispOpen: boolean = false;
    public isContactAdvancedSearchOpen: boolean = false;
    public advanceSearchRequest: any;
    public editContactPersonId: any;
    public editContactPlaceId: any;
    public showScannerModal: boolean = false;
    public isMobileUnit = !!IS_MOBILE_UNIT;
    public broadcastNotificationCount: number = 0;
    public unReadMessagesCount: number = 0;
    public isOpenAbout: boolean = false;
    public hasNotifications: boolean = false;
    public hasEventPanel: boolean = false;
    public hasCalltakerPanel: boolean = false;
    public hasUnitPanel: boolean = false;
    public commandLineVisible: boolean = false;
    public eventPanelVisible: boolean = false;
    public unitPanelVisible: boolean = false;
    public notificationsPanelVisible: boolean = false;
    public adHocTimersPanelVisible: boolean = false;
    public hasAdHocTimers: boolean = false;
    public hasBroadcasts: boolean = false;
    public preemptModalPromise: IDeferred;
    public showPreemptModal: boolean = false;
    public preemptWarningText: string;
    public selectedPreemptAction: number = null;
    private openUnitPropertiesAtSignOn: string = 'N';
    public isShowSuppInfoToBroadcast: boolean = false;
    public SuppInfoDataToBroadcast: any;
    private navigateToTabByNameCallback;
    public dockPanelsToOppositeSide: boolean = false;
    public parentSelectors: string[] = [];
    public eventPanelSettings: IEventPanelSettings = {};
    public calltakerPanelSettings: ICalltakerPanelSettings = {};
    public cmdLineWidth: string;
    public cmdLineWidth2: string;
    private CrossReferenceEventsService: ICrossReferenceEventsService =
        SERVICES?.CrossReferenceEventsService;
    private crossReferenceCancelSubscription: Subscription;
    private crossReferenceCreateSubscription: Subscription;
    private interfaceService: IInterfaceService;
    private widgetPanelOpen: boolean = false;
    private isInitial: boolean = true;
    public systemUpgraded: boolean = false;
    public scrolEnd: boolean = false; // For detecting end of scrolling
    public showAutoDispatchAddonUI: boolean = false;
    public isAutoDispatchDummyView: boolean = false;

    /*
     * Constructor
     */
    constructor(
        private $scope: ng.IScope,
        private $compile: ng.ICompileService,
        private $timeout: ng.ITimeoutService,
        private $location: ng.ILocationService,
        private DashboardService: IDashboardService,
        private CustomizationService: ICustomizationService,
        private BASE_URL: string
    ) {
        this.UnitService = SERVICES.UnitService;
        this.EventService = SERVICES.EventService;

        const injector = angular.element('#mainCtrl').injector();
        this.interfaceService = injector.get('InterfaceService');

        isAutoDispatchActive().then(res => {
            this.showAutoDispatchAddonUI = res;
        });
        console.debug('SingleScreenController created.');
    }

    public $onInit() {
        this.navigateToTabByNameCallback = this.navigateToTabByName.bind(this);
        StateService.registerSingleScreenCallback(this.navigateToTabByNameCallback);
        //TODO - Remove !`isInShell` condition once we migrate from Electron
        if (!IS_IN_SHELL && SCREEN_NUMBER === 0) {
            window.addEventListener('storage', e => {
                if (e.key === 'change-workspace') {
                    try {
                        if (_.isString(e.newValue)) {
                            this.onWorkspaceChange(e.newValue);
                        }
                    } catch (err) {
                        console.error('Error attempting to parse change-workspace message', err);
                    }
                }
            });
        }

        getWatermarkText()
            .then(result => {
                if (result) {
                    this.watermarkText = result;
                    this.isShowingWatermark = true;
                }
            })
            .catch(result => {
                //assume Production, so no action
            });

        needStrings(
            LayoutDefaults.defaultStrings.concat([
                'WORKSPACE_WILL_OPEN_NEW_TABS_PROMPT',
                'EVENT_LIST_CONFIRM_DISPATCH_PROMPT',
                'DO_NOT_SHOW_IN_FUTURE',
                'WEB_LAYOUT_MANAGER',
                'LAYOUT_MGR_USE_LAYOUT_MGR_PROMPT',
                'CONFIG_FEED_SETTING_NOTIFY',
                'LAYOUT_MGR_NO_AVAILABLE_WORKSPACES',
                'CHANGE_TITLE_EVENT',
                'ADD_CROSS_REFERENCE_EVENT_SUCCESS_FROM_TO',
                'CROSS_REFERENCE_CANCEL_SUCCESS_FROM_TO',
                'SWITCH_WORKSPACES_TO_NEWLY_EDITED_PROMPT',
                'LAST_UNIT_PREEMPT_WARNINGTEXT',
                'OCDISP_TAB_TITLE',
                'WEB_DISP_TITLE',
                'WEB_SECGUARDIAN_TITLE',
                'OCSECGUARDIAN_TAB_TITLE',
                'MOBILE_UNIT_TITLE',
                'MOBILE_UNIT_TAB_TITLE',
                'OCSECGUARDIAN_TAB_TITLE',
                'UNIT_PROPERTIES',
                'OPEN_UNIT_PROPERTIES_BY_POLICY',
                'CHAT_HEADER',
                'CHAT_TAB_NOT_FOUND',
                'UNIT_EXCHANGE_END_OF_SHIFT'
            ])
        ).then(() => {
            this.noAvailableWorkspacesMsg = getString('LAYOUT_MGR_NO_AVAILABLE_WORKSPACES');

            getParameterFromTable('AddOnHelp').then(results => {
                if (results && results.length > 0) {
                    const primaryApplication = this.getPrimaryApplicationName();
                    const helpFiles = results.filter(
                        x => _.toLower(x.PrimaryApplication) === primaryApplication
                    );
                    if (helpFiles && helpFiles.length > 0) {
                        _.forEach(helpFiles, file => {
                            this.addOnHelpFiles.push({
                                displayName: file.AddOnHelpName,
                                fileName: file.AddOnHelpWebSite
                            });
                        });
                    }
                }
            });
            viewLoaded();
            this.setActiveTheme();
            document.body.classList.add('single-screen');
            document
                .querySelector('.single-screen-side-menu')
                .addEventListener('transitionend', e => {
                    this.isTransitioningSideMenu = false;
                });

            document.addEventListener('keydown', this.onKeyDown, { passive: true });
            document.addEventListener('keyup', this.onKeyUp, { passive: true });
            document.addEventListener('click', this.onClick);
            document.addEventListener('dismissDockedView', (e: CustomEvent) => {
                const key = e.detail;
                const view = this.dockedViews.find(v => v.key === key);
                if (view) {
                    this.toggleDockedView(view);
                }
            });

            try {
                this.FeedService.getFeedAdded().subscribe(this.feedsChanged);
                this.FeedService.getFeedRemoved().subscribe(this.feedsChanged);
            } catch (e) {
                console.error(
                    'An error occurred while registering for feedsAdded and feedsRemoved: ' + e
                );
            }

            this.crossReferenceCancelSubscription =
                this.CrossReferenceEventsService.getCrossReferenceCancelStream().subscribe(
                    this.acceptStatusFromCancelXREFSignalR
                );
            this.crossReferenceCreateSubscription =
                this.CrossReferenceEventsService.getCrossReferenceCreateStream().subscribe(
                    this.acceptStatusFromCreateXREFSignalR
                );

            // --TODO -- Establish the connection with Rocket Chat Server based on licensing cmdKeys
            initializeChatServerConnection();

            this.refreshAvailableFeeds();

            this.collectUrlParams();

            initLayoutService().then(() => {
                Promise.all([
                    getSharedLayouts(),
                    getSharedTabs(),
                    getStandardViews(),
                    getUserDefinedViews(),
                    getAddonViews(),
                    getSiteWorkspaces(),
                    getAllWorkspacesForUser(),
                    getParameterFromList('UISettings', 'InitialWorkspaceName', 'OnCall'),
                    getParameterFromList('UISettings', 'HideDefaultWorkspaces', 'OnCall'),
                    this.setFeatureFlaggedViews()
                ]).then(
                    ([
                        layouts,
                        tabs,
                        views,
                        userDefinedViews,
                        addonViews,
                        allWorkspaces,
                        allWorkspacesForUser,
                        initialWorkspaceName,
                        hideDefaultWorkspaces
                    ]) => {
                        const empId = getCookie('employeeId');
                        registerWorkspaceChangedCallback(empId, this.onWorkspaceChange);
                        const screenNumber = _.isNumber(SCREEN_NUMBER) ? SCREEN_NUMBER : 0;
                        this.layouts = layouts || LayoutDefaults.layouts;
                        this.tabs = tabs || LayoutDefaults.tabs;
                        this.views = views || LayoutDefaults.standardViews;
                        this.allWorkspaces = allWorkspaces;
                        this.workspaces = allWorkspacesForUser;

                        if (this.showAutoDispatchAddonUI) {
                            this.isAutoDispatchDummyView = true;
                        }

                        if (!_.isEmpty(userDefinedViews)) {
                            this.views = this.views.concat(userDefinedViews);
                        }

                        if (!_.isEmpty(addonViews)) {
                            this.views = this.views.concat(addonViews);
                        }
                        // remove the default workspaces if hideDefaultWorkspace is true
                        if (hideDefaultWorkspaces === '1') {
                            let workspaces = this.workspaces.filter(ws => {
                                const defaultWorkspaceIds = LayoutDefaults.workspaces.map(
                                    defaults => {
                                        return defaults.id;
                                    }
                                );
                                return !defaultWorkspaceIds.includes(ws.id);
                            });
                            this.workspaces = workspaces;
                        }

                        let settings: UserWorkspaceSetting.V2_0_0.UserWorkspaceSetting;
                        const sessionInfo = localStorage.getItem('user_sessionInfo');
                        const sessionId = JSON.parse(sessionInfo)[0]?.sessionId;
                        const initialWorkspaceShown =
                            getLocalStorageItem('initial-workspace-shown') === sessionId;
                        //use initial worksapce, the intial workspace has not already been loaded this session, and the initial workspace is not supported in OMU
                        if (
                            !_.isEmpty(initialWorkspaceName) &&
                            !initialWorkspaceShown &&
                            !IS_MOBILE_UNIT
                        ) {
                            settings = this.getInitialUserWorkspaceSettings(initialWorkspaceName);
                            setLocalStorageItem('initial-workspace-shown', sessionId);
                        }
                        //if initialworkspace cannot be found
                        if (!settings) {
                            let localStorageUserWorkspaceSettings: UserWorkspaceSetting.V2_0_0.UserWorkspaceSetting =
                                getCrossProductLocalStorageItem('user-workspace-settings');
                            if (typeof USER_WORKSPACE_SETTINGS === 'undefined') {
                                if (localStorageUserWorkspaceSettings) {
                                    settings = localStorageUserWorkspaceSettings;
                                } else {
                                    settings = this.setToDefaultDispatcherUserWorkspace();
                                }
                            } else {
                                if (
                                    localStorageUserWorkspaceSettings &&
                                    localStorageUserWorkspaceSettings.workspaceId !==
                                        USER_WORKSPACE_SETTINGS.workspaceId
                                ) {
                                    settings = localStorageUserWorkspaceSettings;
                                } else {
                                    settings = USER_WORKSPACE_SETTINGS;
                                }
                            }
                        }

                        if (
                            userWorkspaceSettingsAreValid(settings) &&
                            userWorkspaceSettingsAvailableToCurrentUserGroup(settings)
                        ) {
                            this.settings = settings;
                        } else if (IS_MOBILE_UNIT) {
                            this.settings = this.setToDefaultMobileUserWorkspace();
                        } else {
                            this.settings = this.setToDefaultDispatcherUserWorkspace();
                        }
                        let workspace = this.urlParams['workspace'] || this.settings.workspaceId;
                        let layout = this.urlParams['layout'];
                        let tab = this.urlParams['tab'];
                        // Check to see if we're missing any default workspaces, layouts, or tabs and if we are add them in
                        if (hideDefaultWorkspaces !== '1') {
                            this.checkDefaultWorkspaces();
                        }
                        this.checkDefaultLayouts();
                        this.checkDefaultTabs();

                        if (!_.isEmpty(this.workspaces) && workspace) {
                            const currentWorkspace = this.findById(this.workspaces, workspace);

                            if (currentWorkspace) {
                                if (IS_MOBILE_UNIT) {
                                    // If we're in mobile unit, we need to load a valid mobile unit route
                                    if (currentWorkspace.type === 'WORKSPACE_MOBILE_UNIT') {
                                        workspace = currentWorkspace.name;
                                    } else {
                                        // We have switched back to mobile unit and our workspace is not a mobile unit view, so select the default mobile unit view
                                        console.log(
                                            'This is not a valid mobile unit workspace, switching to the default mobile unit workspace'
                                        );

                                        const defaultMobileUnitWorkspace = this.findByName(
                                            this.workspaces,
                                            'DEFAULT_MOBILE_UNIT_WORKSPACE'
                                        );
                                        if (defaultMobileUnitWorkspace) {
                                            workspace = defaultMobileUnitWorkspace.name;
                                            this.settings = this.setToDefaultMobileUserWorkspace();
                                        }
                                    }
                                } else if (currentWorkspace.type === 'WORKSPACE_MOBILE_UNIT') {
                                    // We are in dispatcher so if we have a mobile view loaded we need to switch it back
                                    console.log(
                                        'This is not a valid dispatcher workspace, switching to the default dispatcher workspace'
                                    );
                                    const defaultDispatcherWorkspace = this.findByName(
                                        this.workspaces,
                                        'DEFAULT_DISP_WORKSPACE'
                                    );
                                    if (defaultDispatcherWorkspace) {
                                        workspace = defaultDispatcherWorkspace.name;
                                        this.settings = this.setToDefaultDispatcherUserWorkspace();
                                    }
                                }
                            }
                        } else {
                            this.noAvailableWorkspaces = true;
                            this.isLoadingTab = false;
                            return;
                        }

                        const isReload = !!localStorage.getItem('reload-all-simple-windows');

                        if (SCREEN_NUMBER !== 0) {
                            this.openOtherTabs = false;
                            this.offerToOpenOtherTabs = false;
                        } else if (PWA_MODE) {
                            this.openOtherTabs = !isReload;
                            this.offerToOpenOtherTabs = false;
                        } else {
                            if (
                                this.settings &&
                                _.isBoolean(this.settings.openMultipleScreensInBrowser)
                            ) {
                                this.openOtherTabs = this.settings.openMultipleScreensInBrowser;
                            }

                            if (
                                this.settings &&
                                _.isBoolean(this.settings.showOpenMultipleScreensModal)
                            ) {
                                this.offerToOpenOtherTabs =
                                    this.settings.showOpenMultipleScreensModal;
                            }
                        }

                        localStorage.removeItem('reload-all-simple-windows');

                        if (this.settings && !workspace) {
                            workspace = this.getString(this.settings.workspaceId);
                        } else if (this.workspaces.length > 0 && !workspace) {
                            workspace = this.getString(this.workspaces[0].id);
                        }

                        if (workspace) {
                            this.activeWorkspace =
                                this.findById(this.workspaces, workspace) ||
                                this.findByName(this.workspaces, workspace);
                            if (!this.activeWorkspace && !_.isEmpty(this.workspaces)) {
                                this.activeWorkspace = this.workspaces[0];
                                workspace = this.workspaces[0].id;
                            }

                            if (this.activeWorkspace) {
                                this.activeScreen = this.activeWorkspace.screens[screenNumber];
                            }

                            this.setScreenInfo(screenNumber);
                            setActiveWorkspace(this.activeWorkspace);
                        }

                        if (this.settings && !tab && this.activeWorkspace) {
                            const screen = this.settings.screens.find(
                                s => s.screenId === this.activeWorkspace.screens[SCREEN_NUMBER].id
                            );
                            if (screen) {
                                tab = screen.tabId;
                            }
                        }

                        if (!layout && this.layouts.length > 0) {
                            if (this.activeWorkspace) {
                                this.activeScreen = this.activeWorkspace.screens[screenNumber];
                                this.setScreenInfo(screenNumber);
                                let layoutId: string;
                                if (this.settings.screens[screenNumber]) {
                                    layoutId = this.settings.screens[screenNumber].layoutId;
                                } else if (this.activeWorkspace.screens[screenNumber]) {
                                    layoutId =
                                        this.activeWorkspace.screens[screenNumber].layouts[0];
                                }

                                if (this.layouts.some(l => l && l.id === layoutId)) {
                                    layout = layoutId;
                                }
                            }

                            if (!layout) {
                                const firstViableLayout = this.layouts.find(l => !!l);
                                layout = firstViableLayout?.id;
                            }
                        }

                        this.setInitialState(layout, tab, true);
                        registerCmdKeyProvider(this, 'CHANGETAB', true, true, false, false, true);

                        if (IS_MOBILE_UNIT) {
                            const empId = getCookie('employeeId');
                            console.debug(
                                `SingleScreen: empId-${empId}, localStorage for ${empId}-updateUnitProps is `,
                                localStorage.getItem(`${empId}-updateUnitProps`)
                            );
                            console.debug(
                                `SingleScreen: localStorage for ${empId}-updatedAfterSignOn is `,
                                localStorage.getItem(`${empId}-updatedAfterSignOn`)
                            );
                            getParameterFromList(
                                'General',
                                'OpenUnitPropertiesAtSignOn',
                                'mobileunit'
                            ).then(param => {
                                if (param) {
                                    this.openUnitPropertiesAtSignOn = _.toUpper(param);
                                }
                                console.log(
                                    `SingleScreen.constructor: OpenUnitPropertiesAtSignOn, `,
                                    param
                                );
                                if (
                                    (localStorage.getItem(`${empId}-updateUnitProps`) === 'true' ||
                                        this.openUnitPropertiesAtSignOn === 'Y') &&
                                    localStorage.getItem(`${empId}-updatedAfterSignOn`) === 'false'
                                ) {
                                    let notify: boolean = false;
                                    if (
                                        this.openUnitPropertiesAtSignOn === 'Y' &&
                                        (_.isNil(
                                            localStorage.getItem(`${empId}-updateUnitProps`)
                                        ) ||
                                            localStorage.getItem(`${empId}-updateUnitProps`) ===
                                                'false')
                                    ) {
                                        localStorage.setItem(`${empId}-updateUnitProps`, 'true');
                                        notify = true;
                                    }
                                    processCommandKey('UNITPROP', `-U ${this.unitId}`)
                                        .then(() => {
                                            if (notify) {
                                                initNotifications().then(() => {
                                                    submitNotification(
                                                        getString('UNIT_PROPERTIES'),
                                                        getString('OPEN_UNIT_PROPERTIES_BY_POLICY'),
                                                        {
                                                            type: NotificationType.System,
                                                            systemSubType:
                                                                SystemNotificationType.Info
                                                        }
                                                    );
                                                });
                                            }
                                        })
                                        .catch(error => {
                                            console.error(
                                                'SingleScreen: Error running command',
                                                error
                                            );
                                        })
                                        .finally(() => {
                                            localStorage.setItem(
                                                `${empId}-updatedAfterSignOn`,
                                                'true'
                                            );
                                        });
                                }
                            });
                        }

                        if (_.isNil(this.urlParams['wsscreen'])) {
                            workspace = workspace || this.workspaces[0].id;
                            this.activeWorkspace =
                                this.findById(this.workspaces, workspace) ||
                                this.findByName(this.workspaces, workspace);
                            const ws = this.activeWorkspace;
                            this.activeScreen = ws.screens[screenNumber];
                            this.setScreenInfo(screenNumber);
                            setActiveWorkspace(ws);

                            //TODO - Remove `isInShell` check after migrating from Electron
                            if (
                                !IS_IN_SHELL &&
                                (this.offerToOpenOtherTabs || this.openOtherTabs) &&
                                ws &&
                                ws.screens &&
                                ws.screens.length > 1
                            ) {
                                this.setOtherScreens();
                            }
                        }
                    }
                );
            });

            if (this.isPltEnabled()) {
                this.interfaceService.registerForNotification(
                    'GeoMonitor',
                    'GeoMonitorEnablePersonTracking',
                    this.notifyPltEnable
                );
                this.interfaceService.registerForNotification(
                    'GeoMonitor',
                    'GeoMonitorDisablePersonTracking',
                    this.notifyPltDisable
                );

                const pltUnitsinSession: string[] = JSON.parse(
                    sessionStorage.getItem('session-plt-units')
                ) as string[];
                if (pltUnitsinSession?.length > 0) {
                    pltUnitsinSession.map(unit => {
                        this.UnitService.enableUnitForPersonTracking(unit);
                    });
                }
            }

            window.addEventListener('storage', this.handleLocalStorageEvent);
        });

        this.$scope.$on('confirm-dispatch', (e, msg: IConfirmDispatchMessage) => {
            this.confirmText = getStrings(
                'EVENT_LIST_CONFIRM_DISPATCH_PROMPT',
                msg.unitIds.join(', '),
                msg.event.type
            );
            this.showConfirmationModal = true;
            this.confirmationPromise = new Deferred();
            this.confirmationPromise.promise
                .then(() => {
                    processCommandKey('DISPUNIT', `-U ${msg.unitIds.join(' ')} -E ${msg.event.id}`);
                })
                .finally(() => {
                    this.showConfirmationModal = false;
                });
        });

        this.$scope.$on('notification-count-change', (e, { count }) => {
            this.menuNotificationCount = count;
        });

        this.$scope.$on('notification-snooze-change', (e, { snooze }) => {
            this.notificationsSnoozed = snooze;
        });

        if (IS_MOBILE_UNIT) {
            this.unitId = getCookie('omuUnitId');
            if (this.unitId) {
                SERVICES.UnitService.registerUpdateCallback(this.mobileUnitUpdated, this.unitId);
            }
        }

        window.addEventListener('message', event => {
            if (
                event?.data?.type === 'suppInfoToBroadcast' &&
                event?.origin &&
                GLOBAL_BASE_URL.startsWith(event.origin)
            ) {
                this.isShowSuppInfoToBroadcast = true;
                this.SuppInfoDataToBroadcast = event.data.suppInfo;
            }
        });

        registerSetTabDisabledCallback(this.disableTabCallback);
        registerForShowDialog(this.proqaMultiDisp);

        // To initialize disable tab or not
        this.setDisabledMyEventTab();
        this.CustomizationService.setPopupCallback(this.openPopup);

        registerForSummaryChanges(this.updateBroadcastHeader);

        registerForChatUnReadMessages(this.updateChatUnReadMessagesHeader);

        registerAnimationCompleteCallback(this.handlePanelStateChange);

        registerPreemptModalCallback(this.handlePreemptModal);

        subscribeToSystemUpgradedCallback(this.setSystemUpgraded);

        registerUnitExchangeModalCallback(this.handleUnitExchangeModal);

        window.addEventListener('resize', () => {
            this.navBarScrollHandle('onWindowResize');
        });
    }

    private getInitialUserWorkspaceSettings = (
        initialWorkspaceName: string
    ): UserWorkspaceSetting.V2_0_0.UserWorkspaceSetting => {
        const initialworkspace = this.workspaces.find(ws => ws.name === initialWorkspaceName);
        let settings: UserWorkspaceSetting.V2_0_0.UserWorkspaceSetting = null;
        if (initialworkspace) {
            settings = new UserWorkspaceSetting.V2_0_0.UserWorkspaceSetting();
            settings.workspaceId = initialworkspace.id;
            settings.openMultipleScreensInBrowser = true;
            settings.showOpenMultipleScreensModal = true;
            settings.version = '1.0.0';
            const screens = _.sortBy(initialworkspace.screens, s => s.order);

            settings.screens = screens.map(s => {
                let selectedLayout = s.layouts[0];
                return {
                    screenId: s.id,
                    workspaceId: settings.workspaceId,
                    layoutId: selectedLayout,
                    tabId: ''
                };
            });
            if (
                typeof USER_WORKSPACE_SETTINGS !== 'undefined' &&
                USER_WORKSPACE_SETTINGS.workspaceId !== settings.workspaceId
            ) {
                saveUserWorkspaceSettings(settings);
            }
        }

        return settings;
    };

    private handlePreemptModal = (
        unitId: string,
        eventId: string,
        msg: string
    ): Promise<number> => {
        let preemptAction: number;
        return new Promise((resolve, reject) => {
            try {
                this.confirmPreemptAction(unitId, eventId, msg)
                    .then(() => {
                        preemptAction = this.selectedPreemptAction;
                        resolve(preemptAction);
                    })
                    .catch(() => {
                        resolve(null);
                    })
                    .finally(() => {
                        this.showPreemptModal = false;
                        this.selectedPreemptAction = null;
                    });
            } catch (e) {
                console.error(`failed to set preempt unit action`, e);
            }
        });
    };

    private handleUnitExchangeModal = (unitId: string): Promise<boolean> => {
        return new Promise((resolve, reject) => {
            try {
                this.showConfirmationModal = true;
                this.confirmText = getStrings('UNIT_EXCHANGE_END_OF_SHIFT', unitId);
                this.confirmationPromise = new Deferred();
                this.confirmationPromise.promise
                    .then(() => {
                        resolve(true);
                    })
                    .catch(() => {
                        resolve(false);
                    })
                    .finally(() => {
                        this.showConfirmationModal = false;
                    });
            } catch (e) {
                console.error(`failed to confirm unit exchange - handleUnitExchangeModal`, e);
            }
        });
    };

    private confirmPreemptAction = (unitId: string, eventId: string, msg: string): Promise<any> => {
        this.preemptModalPromise = new Deferred();
        this.preemptWarningText = getStrings(msg, unitId, eventId);
        this.showPreemptModal = true;
        return this.preemptModalPromise.promise;
    };

    public onPreemptActionSelect = (val: number) => {
        this.selectedPreemptAction = val;
    };

    private setScreenInfo = (screenNumber: number) => {
        const isOneScreen =
            this.activeWorkspace?.screens.length === 1 ||
            (screenNumber === 0 && !this.openOtherTabs);

        this.hasNotifications = isOneScreen || !!this.activeScreen?.hasNotifications;
        this.hasEventPanel = isOneScreen || !!this.activeScreen?.hasEventPanel;
        this.hasCalltakerPanel = isOneScreen || !!this.activeScreen?.hasCalltakerPanel;
        this.hasUnitPanel = isOneScreen || !!this.activeScreen?.hasUnitPanel;
        this.hasAdHocTimers =
            !IS_MOBILE_UNIT && (isOneScreen || !!this.activeScreen?.hasAdHocTimers);
        this.hasBroadcasts = !!this.activeScreen?.hasBroadcasts;
        this.eventPanelSettings = {
            defaultTab: this.activeScreen?.eventPanelDefaultTab,
            dockedTab: this.activeScreen?.eventPanelDockedTab,
            selectedTabs: this.activeScreen?.eventPanelSelectedTabs
        };
        //this.calltakerPanelSettings = this.activeScreen?.calltakerPanelSettings;
        this.calltakerPanelSettings = {
            dockedTab: this.activeScreen?.calltakerPanelDockedTab,
            selectedTabs: this.activeScreen?.calltakerPanelSelectedTabs,
            extendedTabs: this.activeScreen?.calltakerPanelExtendedTabs
        };
        putCalltakerPanelSettings(this.calltakerPanelSettings);
        putEventPanelSettings(this.eventPanelSettings);
        this.dockPanelsToOppositeSide =
            (this.hasEventPanel || this.hasUnitPanel || this.hasCalltakerPanel) &&
            !!this.activeScreen?.dockPanelsToOppositeSide;
        setWindowInformation(this.activeWorkspace, isOneScreen);
    };

    public acceptStatusFromCreateXREFSignalR(
        notif: CrossReferenceCreate.V1_0_0.CrossReferenceCreate
    ): void {
        SERVICES.EventService.get(notif.fromAgencyEventId).then(results => {
            const eventData = {} as ICacheChangeArgs<IEventCacheItem>;
            eventData.data = results;
            const body = getStrings(
                'ADD_CROSS_REFERENCE_EVENT_SUCCESS_FROM_TO',
                notif.fromAgencyEventId,
                notif.toAgencyEventId
            );
            const subj = getStrings('CHANGE_TITLE_EVENT', notif.fromAgencyEventId);
            submitNotification(
                subj,
                body,
                {
                    type: NotificationType.UpdatedEvent,
                    eventChange: eventData
                },
                null,
                null,
                true
            );
        });
    }

    public acceptStatusFromCancelXREFSignalR(
        notif: CrossReferenceCancel.V1_0_0.CrossReferenceCancel
    ): void {
        SERVICES.EventService.get(notif.fromAgencyEventId).then(results => {
            const eventData = {} as ICacheChangeArgs<IEventCacheItem>;
            eventData.data = results;
            const body = getStrings(
                'CROSS_REFERENCE_CANCEL_SUCCESS_FROM_TO',
                notif.fromAgencyEventId,
                notif.toAgencyEventId
            );
            const subj = getStrings('CHANGE_TITLE_EVENT', notif.fromAgencyEventId);
            submitNotification(
                subj,
                body,
                {
                    type: NotificationType.UpdatedEvent,
                    eventChange: eventData
                },
                null,
                null,
                true
            );
        });
    }

    private getPrimaryApplicationName(): string {
        let primaryApplicationName: string = 'oncalldispatcher';
        if (IS_MOBILE_UNIT) {
            primaryApplicationName = 'oncallmobileunit';
        }

        console.debug(`Help's PrimaryApplicationName: ${primaryApplicationName}`);
        return primaryApplicationName;
    }

    public $onDestroy() {
        unregisterSetTabDisabledCallback(this.disableTabCallback);
        unregisterForChatUnReadMessages(this.updateChatUnReadMessagesHeader);
        unregisterAnimationCompleteCallback(this.handlePanelStateChange);
        this.crossReferenceCancelSubscription?.unsubscribe();
        this.crossReferenceCreateSubscription?.unsubscribe();
        unregisterPreemptModalCallback(this.handlePreemptModal);
        unregisterUnitExchangeModalCallback(this.handleUnitExchangeModal);

        window.removeEventListener('storage', this.handleLocalStorageEvent);
        unregisterForWindowUnload();

        const empId = getCookie('employeeId');
        unregisterWorkspaceChangedCallback(empId, this.onWorkspaceChange);
        unsubscribeFromSystemUpgradedCallback(this.setSystemUpgraded);
        if (this.isPltEnabled()) {
            this.interfaceService?.deregisterFromNotifications(
                'GeoMonitor',
                'GeoMonitorEnablePersonTracking',
                this.notifyPltEnable
            );
            this.interfaceService?.deregisterFromNotifications(
                'GeoMonitor',
                'GeoMonitorDisablePersonTracking',
                this.notifyPltDisable
            );
        }
    }

    private isPltEnabled = () => {
        return canRunCommandKey('ENABLEPLT') || isOmuPltEnabled;
    };

    private notifyPltEnable = (source: string, type: string, body: string) => {
        console.log(`GeoMonitorEnableNotification source: ${source} type: ${type} body: ${body}`);

        const data = JSON.parse(body) as any;
        const unitIds = data['unitIds'];
        unitIds?.map(unit => {
            this.setPersonLevelTrackingEnabeldStatus(unit, true);
        });
    };

    private notifyPltDisable = (source: string, type: string, body: string) => {
        console.log(`GeoMonitorEnableNotification source: ${source} type: ${type} body: ${body}`);

        const data = JSON.parse(body) as any;
        const unitIds = data['unitIds'];
        unitIds?.map(unit => {
            this.setPersonLevelTrackingEnabeldStatus(unit, false);
        });
    };

    setPersonLevelTrackingEnabeldStatus = (unit: string, status: boolean): void => {
        if (unit) {
            if (status) {
                this.UnitService.enableUnitForPersonTracking(unit);
            } else {
                this.UnitService.disableUnitForPersonTracking(unit);
            }

            // Notify other windows that units enabled for PLT updated
            const unitsEnabledForPersonTracking =
                this.UnitService.getEnabledForPersonTrackingUnits();
            window.localStorage.setItem(
                'plt-unit-ids',
                JSON.stringify(unitsEnabledForPersonTracking)
            );
        }
    };

    public disableTabCallback = (tab: string, disabled: boolean) => {
        if (disabled) {
            this.addToDisableTabName(tab);
        } else {
            this.removeFromDisableTabName(tab);
        }
    };

    public updateDialogDisplay = (event: JQueryEventObject) => {
        if (event) {
            $(event.target)
                .closest('.dialog-container')
                ?.css('z-index', ++z_index.currentMaxZindex);
        }

        if ($(event.target).hasClass('about-box-close-button')) {
            if (this.isOpenAbout) {
                this.isOpenAbout = false;
            }
        }

        const modalRecall: Element = document.querySelector('.react-modal');
        if (modalRecall) {
            const backDropRecall: Element = document.querySelector('.react-modal-backdrop');
            backDropRecall['style']['zIndex'] = z_index.currentMaxZindex + 2;
        }
    };

    public formattedHeaderCount = (count: number) => {
        if (count > 99) {
            return '99+';
        }
        return String(count).padStart(2, '0');
    };

    public broadcastImageClassName = () =>
        this.broadcastNotificationCount > 0 ? 'broadcast-header-image' : '';

    public chatImageClassName = () => (this.unReadMessagesCount > 0 ? 'chat-header-image' : '');

    public isChatAvailable = () => {
        return isRocketChatEnabled();
    };

    public updateBroadcastHeader = (updatedBroadcastSummaries: IBroadcastSummaryItem[]) => {
        let unReadBroadcastIds: number[] = [];
        this.broadcastNotificationCount = updatedBroadcastSummaries
            ? updatedBroadcastSummaries.reduce((count, bcItem) => {
                  if (
                      !bcItem.isRead &&
                      bcItem.broadcast.broadcastState === 1 &&
                      !bcItem.isRestricted
                  ) {
                      if (this.isInitial) {
                          unReadBroadcastIds.push(bcItem?.broadcastid);
                      } else {
                          if (unreadBroadcastExists(bcItem?.broadcastid)) {
                              return count;
                          }
                      }
                      return count + 1;
                  }
                  return count;
              }, 0)
            : 0;
        if (this.isInitial) {
            setUnreadBroadcasts(unReadBroadcastIds);
        }
        this.isInitial = false;
    };

    public getFeedCount = () => {
        let feedCount = parseInt(window.localStorage.getItem('FeedCount'));

        if (!_.isNull(feedCount) && !_.isNaN(feedCount)) {
            return feedCount;
        }

        return 0;
    };

    public updateChatUnReadMessagesHeader = (updatedCount?: number) => {
        this.unReadMessagesCount = updatedCount;
    };

    public onBroadcastHeaderButton = () => {
        changeTabToBroadcast();
    };

    public onChatHeaderButton = () => {
        let chatTabName: string;
        chatTabName = this.findActiveTabNameWithViewName('"key":"CHAT_WIDGET"');
        if (!!chatTabName) {
            processCommand(`CHANGE TAB -N ${chatTabName}`);
        } else {
            submitNotification(getString('CHAT_HEADER'), getString('CHAT_TAB_NOT_FOUND'), {
                type: NotificationType.System,
                systemSubType: SystemNotificationType.Info
            });
        }
    };

    public toggleContactDirectoryPanel = (show?: boolean) => {
        const closeGeofence = document.getElementById('geofence-close');
        if (closeGeofence) {
            closeGeofence.click();
        }
        const feedContainer = document.getElementById('contact-directory-container');

        if (feedContainer) {
            if (
                (show || show === undefined) &&
                !feedContainer.classList.contains('contact-directory-show')
            ) {
                //show
                this.hideDocksInDirection(
                    IS_RTL ? DockDirection.Left : DockDirection.Right,
                    DOCK_HIDE_DIRECTIONS['CONTACT_DIRECTORY_MENU'],
                    'CONTACT_DIRECTORY_MENU'
                );
                feedContainer.classList.remove('hide-contact-directory-container');
                feedContainer.classList.add('contact-directory-show');
                feedContainer.classList.add('cd-tabbable-panel');
                contactsPanelToggled.next(true);
                feedContainer.removeAttribute('style');
                const statusBar = document.getElementsByClassName('status-bar-ribbon')[0];
                const containerHeight = IS_MOBILE_UNIT
                    ? feedContainer.clientHeight - statusBar.clientHeight
                    : feedContainer.clientHeight;
                feedContainer.setAttribute('style', 'height: ' + containerHeight + 'px');
            } else if (!show) {
                //hide
                const closeButton = document.getElementById('contact-directory-close-button');
                if (closeButton) {
                    closeButton.click();
                }
                contactsPanelToggled.next(false);
            }
        }
    };

    public toggleFeedsPanel = (show?: boolean) => {
        const closeGeofence = document.getElementById('geofence-close');
        if (closeGeofence) {
            closeGeofence.click();
        }

        const feedContainer = document.getElementById('feed-container-panel');

        if (feedContainer) {
            if (
                (show || show === undefined) &&
                !feedContainer.classList.contains('feed-container-show')
            ) {
                feedContainer.classList.remove('hide-feed-container');
                feedContainer.classList.add('feed-container-show');
                feedContainer.classList.add('cd-tabbable-panel');

                feedContainer.removeAttribute('style');
                const statusBar = document.getElementsByClassName('status-bar-ribbon')[0];
                const containerHeight = IS_MOBILE_UNIT
                    ? feedContainer.clientHeight - statusBar.clientHeight
                    : feedContainer.clientHeight;
                feedContainer.setAttribute('style', 'height: ' + containerHeight + 'px');
            } else if (!show && !feedContainer.classList.contains('hide-feed-container')) {
                //hide
                const closeButton = document.getElementById('feeds-panel-close');
                if (closeButton) {
                    closeButton.click();
                }
            }
        }
    };

    // Contact Directory functions moved from SingleScreenMapView.ts as per AZDO 258956
    public addNewContact = () => {
        this.isAddNewContactOpen = true;
    };

    public closeAddContactDialog = () => {
        this.isAddNewContactOpen = false;
    };

    public contactSearch = () => {
        this.isContactAdvancedSearchOpen = true;
    };

    public closeContactSearchDialog = () => {
        this.isContactAdvancedSearchOpen = false;
    };

    public advanceSearchChanges = (searchObj: any) => {
        this.advanceSearchRequest = searchObj;
    };

    public contactPersonId = (personId: any) => {
        this.editContactPersonId = personId;
    };

    public editPersonContact = () => {
        this.isEditPersonContactOpen = true;
    };

    public closeEditContactPersonDialog = () => {
        this.isEditPersonContactOpen = false;
    };

    public contactPlaceId = (placeId: any) => {
        this.editContactPlaceId = placeId;
    };

    public editPlaceContact = () => {
        this.isEditPlaceContactOpen = true;
    };

    public closeEditContactPlaceDialog = () => {
        this.isEditPlaceContactOpen = false;
    };

    public proqaMultiDisp = () => {
        this.$scope.$applyAsync(() => {
            this.isProqaMultiDispOpen = true;
        });
    };

    public closeProqaMultiDisp = () => {
        this.$scope.$applyAsync(() => {
            this.isProqaMultiDispOpen = false;
        });
    };

    public CloseSuppInfoToBroadcastPublisher = () => {
        this.isShowSuppInfoToBroadcast = false;
    };

    private setToDefaultDispatcherUserWorkspace =
        (): UserWorkspaceSetting.V2_0_0.UserWorkspaceSetting => {
            console.log('Reset to default dispatcher workspace');
            const dispSettings = _.cloneDeep(LayoutDefaults.defaultUserWorkspaceSettings);
            saveUserWorkspaceSettings(dispSettings);
            return dispSettings;
        };

    private setToDefaultMobileUserWorkspace =
        (): UserWorkspaceSetting.V2_0_0.UserWorkspaceSetting => {
            console.log('Reset to default mobile workspace');
            const mobileSettings = _.cloneDeep(LayoutDefaults.defaultMobileUserWorkspaceSettings);
            saveUserWorkspaceSettings(mobileSettings);
            return mobileSettings;
        };

    public onCommandInit = (data: IDialogCommandRequest): Promise<IDialogCommandRequest> => {
        return Promise.resolve(data);
    };

    public onCommandSubmit = (data: IDialogCommandRequest): Promise<ICommandResult> =>
        new Promise((resolve, reject) => {
            const req = data.req as ChangeTab.V1_0_0.ChangeTab;
            let foundTab = _.find(
                this.activeTabs,
                tab =>
                    this.stringsEqual(tab.label, req.tabName) ||
                    this.stringsEqual(tab.name, req.tabName) ||
                    this.stringsEqual(tab.id, req.tabName)
            );
            if (!foundTab) {
                foundTab = _.find(this.activeTabs, tab => tab.name.includes(req.tabName));
            }
            // The My Event tab could be a clone
            if (!foundTab && req.tabName === this.myEventTabNameDefault) {
                foundTab = this.findActiveTabWithViewName(this.selectedEventViewName);
            }

            if (!foundTab) {
                // if tab not found in active layout resolve and return;  However the Tab might be on another screen.
                // Send Local Storage Msg in case Tab is on another screen to select it
                console.warn(
                    `Not found tab ${req.tabName} in current window. Set change-active-tab in localStorage.`
                );

                if (req.tabName === '_MESSAGES') {
                    const messaggeReq = data.req as SendMessage.V1_0_1.SendMessageRequest;
                    const url = `${GLOBAL_BASE_URL}dispatcher/MessagingView${
                        IS_IN_SHELL ? '?Shell=true' : ''
                    }`;
                    createWindow(
                        getString('MESSAGES'),
                        { width: 1000, height: 600 },
                        url,
                        messaggeReq
                    );
                }

                this.setChangeActiveTabInStorage(req.tabName);
            } else {
                this.navigateToTabById(foundTab.id)
                    .then(() => {
                        resolve({
                            success: true,
                            msgs: [],
                            rsp: undefined
                        });
                    })
                    .catch(err => {
                        reject(err);
                    });
            }
        });

    private setChangeActiveTabInStorage = (tabName: string) => {
        // Set Tab name in local storage; other windows should respond to this event and change tab
        // have to delete the value because the storage event won't fire again in other window if value is same.
        deleteLocalStorageItem('change-active-tab');
        setLocalStorageItem('change-active-tab', tabName);
    };

    private setActiveTheme = () => {
        // Look for theme name in local storage
        const themeName = getCrossProductLocalStorageItem('theme-name');
        // If found, load theme
        if (themeName) {
            setTheme(themeName);
        }
    };

    private buildActiveTabList = () => {
        this.activeTabs = _.map(this.activeLayout.tabs, activeTab =>
            _.find(this.tabs, t => t.id === activeTab)
        );
        // set activeTabs in LayoutService.ts
        setActiveTabs(this.activeTabs);
    };

    private handleLocalStorageEvent = ({ key, newValue }: StorageEvent) => {
        if (newValue) {
            const employeeId = getCookie('employeeId');

            let prefixedKeyChangeView: string;
            let prefixedKeySetActiveTab: string;
            let prefixedKeyResendActiveTab: string;
            let prefixedKeyClearActiveTab: string;
            if (key.includes(getUnreadBroadcastKey())) {
                this.broadcastNotificationCount = getUnreadBroadcastCount();
            }

            if (key.includes('change-active-tab-view')) {
                prefixedKeyChangeView = `${employeeId}-${PRODUCT_SHORT_NAME}-change-active-tab-view`;
            }
            if (key.includes('set-screen-active-tab')) {
                prefixedKeySetActiveTab = `${employeeId}-${PRODUCT_SHORT_NAME}-set-screen-active-tab`;
            }
            if (key.includes('resend-screen-active-tab')) {
                prefixedKeyResendActiveTab = `${employeeId}-${PRODUCT_SHORT_NAME}-resend-screen-active-tab`;
            }
            if (key.includes('clear-screen-active-tab')) {
                prefixedKeyClearActiveTab = `${employeeId}-${PRODUCT_SHORT_NAME}-clear-screen-active-tab`;
            }
            const prefixedKey = `${employeeId}-${PRODUCT_SHORT_NAME}-change-active-tab`;
            switch (key) {
                case 'updated-workspace':
                    return this.addWorkspace(newValue);
                case 'updated-layout':
                    return this.addLayout(newValue);
                case 'updated-tab':
                    return this.addTab(newValue);
                case prefixedKeyChangeView:
                    const viewKey = newValue.slice(1, -1);
                    const tabObj = tabListHasViewWithKey(this.activeTabs, viewKey);
                    return this.changeTab(tabObj.tabNameWithView);
                case prefixedKeySetActiveTab:
                    const sat: ScreenActiveTab = JSON.parse(newValue);
                    setScreenActiveTabMap(sat.screen, sat.activeTab);
                    return;
                case prefixedKeyResendActiveTab:
                    const resendSat = new ScreenActiveTab(SCREEN_NUMBER, this.activeTab);
                    deleteLocalStorageItem('set-screen-active-tab');
                    setLocalStorageItem('set-screen-active-tab', resendSat);
                    clearScreenActiveTapMap();
                    return;
                case prefixedKeyClearActiveTab:
                    clearScreenActiveTapMap();
                    return;
                case prefixedKey:
                    return this.changeTab(newValue);
                default:
                    return;
            }
        }
    };

    private resendActiveTab = () => {
        // send local storage message so other windows can resend their active tab
        deleteLocalStorageItem('resend-screen-active-tab');
        setLocalStorageItem('resend-screen-active-tab', Date.now());
    };

    private changeTab = (val: string) => {
        if (!_.isEmpty(val)) {
            let tabName;
            try {
                tabName = JSON.parse(val);
            } catch (e) {
                tabName = val;
            }
            const foundTab = _.find(
                this.activeTabs,
                tab =>
                    this.stringsEqual(tab.label, tabName) ||
                    this.stringsEqual(tab.name, tabName) ||
                    this.stringsEqual(tab.id, tabName)
            );
            if (foundTab) {
                this.navigateToTabById(foundTab.id);
            }
        }
    };

    private addTab = (val: string) => {
        try {
            const tab: LayoutTab.V2_0_0.LayoutTab = JSON.parse(val);
            const tabs = _.cloneDeep(this.tabs);
            const i = tabs.findIndex(t => t.id === tab.id);

            if (i !== -1) {
                tabs[i] = tab;
            } else {
                tabs.push(tab);
            }

            this.tabs = tabs;
            this.setEventBoardFilterInLocalStorage();
            this.setUnitBoardFilterInLocalStorage();

            if (tab.id === this.activeTab.id) {
                this.navigateToTab(tab, true);
            }
        } catch (e) {
            console.error(`[SingleScreen.addTab] failed to parse added tab`, e);
        }
    };

    private setEventBoardFilterInLocalStorage = () => {
        let tabId = '';
        // the new event notification sync is just stored on the workspace itself
        tabId = this.activeWorkspace.syncEventNotifications;

        if (!_.isEmpty(tabId)) {
            window.localStorage.setItem('is-sync-event-filter-enabled', true.toString());
            this.EventService.setEventBoardFilterInLocalStorage(tabId);
        } else {
            window.localStorage.setItem('is-sync-event-filter-enabled', false.toString());
        }
    };

    private setUnitBoardFilterInLocalStorage = () => {
        const syncUnitBoard = this.activeWorkspace.syncUnitNotifications;
        if (!_.isEmpty(syncUnitBoard)) {
            window.localStorage.setItem('is-sync-unit-filter-enabled', true.toString());
            this.UnitService.setUnitBoardFilterInLocalStorage(syncUnitBoard);
        } else {
            window.localStorage.setItem('is-sync-unit-filter-enabled', false.toString());
        }
    };

    private addLayout = (val: string) => {
        try {
            const layout: Layout.V1_0_0.Layout = JSON.parse(val);
            const layouts = _.cloneDeep(this.layouts);
            const i = this.layouts.findIndex(l => l.id === layout.id);

            if (i !== -1) {
                layouts[i] = layout;
            } else {
                layouts.push(layout);
            }
            this.layouts = layouts;

            if (this.activeLayout.id === layout.id) {
                this.setLayout(layout);
            }
        } catch (e) {
            console.error(`[SingleScreen.addLayout] failed to parse added layout`, e);
        }
    };

    private addWorkspace = (val: string) => {
        try {
            const ws: Workspace.V4_0_0.Workspace = JSON.parse(val);
            const workspaces = _.cloneDeep(this.workspaces);
            const i = workspaces.findIndex(w => w.id === ws.id);

            if (i !== -1) {
                workspaces[i] = ws;
            } else {
                workspaces.push(ws);
            }

            this.workspaces = workspaces;

            if (ws.id === this.activeWorkspace.id) {
                this.onWorkspaceChange(ws.id);
            } else if (
                confirm(
                    getStrings(
                        'SWITCH_WORKSPACES_TO_NEWLY_EDITED_PROMPT',
                        getIfNotLocalized(ws.name)
                    )
                )
            ) {
                this.onWorkspaceChange(ws.id);
            }
        } catch (e) {
            console.error(`[SingleScreen.addWorkspace] failed to parse added workspace`, e);
        }
    };

    public onCommandSuccess = (data: IDialogCommandRequest): Promise<void> => Promise.reject();

    public onCommandFail = (data: IDialogCommandRequest): Promise<void> => Promise.reject();

    private onKeyDown = (e: KeyboardEvent) => {
        const isInInput =
            document.activeElement &&
            (document.activeElement.nodeName.toLowerCase() === 'input' ||
                (document.activeElement as HTMLDivElement).isContentEditable);
        if (isInInput) {
            this.pressedKeys = [];
        } else {
            let key = e.key.toUpperCase();
            if (key === ' ') {
                key = 'SPACE';
            } else if (key === 'CONTROL') {
                key = 'CTRL';
            }

            if (this.newKeyPress) {
                this.newKeyPress = false;
                this.pressedKeys = [key];
            } else if (this.pressedKeys.indexOf(key) === -1) {
                this.pressedKeys.push(key);
            }
        }
    };

    private onKeyUp = (e: KeyboardEvent) => {
        this.newKeyPress = true;
        const isInInput =
            document.activeElement &&
            (document.activeElement.nodeName.toLowerCase() === 'input' ||
                (document.activeElement as HTMLDivElement).isContentEditable);
        if (!isInInput) {
            this.handleGlobalKeyboardShortcuts();
        }
    };

    private onClick = (e: MouseEvent) => {
        const el = e.target as HTMLElement;
        if (el.classList.contains('tab-container-view') && el.closest('.oc-navbar.single-screen')) {
            const navBar = document.querySelector<HTMLElement>('.oc-navbar.single-screen');
            const selectedEl = navBar.querySelector('.tab-header-selected');
            selectedEl?.classList.remove('tab-header-selected');
            el.classList.add('tab-header-selected');
        }
    };

    private handleGlobalKeyboardShortcuts = () => {
        this.pressedKeys.sort();
        Object.keys(this.dockKeyboardShortcuts).forEach(key => {
            const combo = this.dockKeyboardShortcuts[key];
            combo.sort();
            if (_.isEqual(this.pressedKeys, combo)) {
                if (key === 'COMMAND_LINE_VIEW') {
                    this.pressedKeys = [];
                    this.showCommandLine();
                } else {
                    const view = this.dockedViews.find(v => v.key === key);
                    if (view) {
                        this.pressedKeys = [];
                        this.toggleDockedView(view);
                    }
                }
            }
        });

        if (_.isEqual(this.pressedKeys, ['Escape'])) {
            this.hideCommandLine();
        }
    };

    // return the amount of docked command lines that are currently available in the active layout
    private getAmountOfDockedCommandLines = (): number => {
        return document.querySelectorAll(`[data-view-key="COMMAND_LINE_VIEW"]`).length;
    };

    public showCommandLine = () => {
        const cmdLine = document.querySelector(
            `.docked-view-toggle[data-view="COMMAND_LINE_VIEW"]`
        ) as HTMLElement;
        const input = document.querySelector('.command-line-input') as HTMLInputElement;
        if (cmdLine && !cmdLine.classList.contains('active')) {
            cmdLine.click();
        }
        if (input) {
            input.focus();
        }
    };

    public hideCommandLine = () => {
        const input = document.activeElement as HTMLInputElement;
        const focusIsInInput =
            input &&
            (input.nodeName.toLowerCase() === 'input' ||
                input.nodeName.toLowerCase() === 'textarea' ||
                input.attributes['contenteditable']);
        const isCommandLine = focusIsInInput && input.classList.contains('command-line-input');
        const cmdLine = document.querySelector(
            `.docked-view-toggle[data-view="COMMAND_LINE_VIEW"]`
        ) as HTMLElement;
        const cmdLineIsVisible = document.querySelector('.command-line-input');
        if (isCommandLine) {
            input.value = '';
            input.blur();
        } else if (!focusIsInInput && cmdLineIsVisible) {
            cmdLine.click();
        }
    };

    public setInitialState = (layoutId: string, tabName: string, isLayoutRefresh?: boolean) => {
        this.activeLayout =
            this.findById(this.layouts, layoutId) ||
            this.findByName(this.layouts, layoutId) ||
            this.layouts[0];
        if (this.activeLayout) {
            SELECTED_LAYOUT = this.activeLayout;
            setActiveLayout(this.activeLayout);
            this.$scope.$emit('set-layout');
            const possibleTabs = this.tabs.filter(t =>
                this.activeLayout.tabs.some(tab => tab === t.id)
            );

            let chosenTab =
                possibleTabs.find(t => this.stringsEqual(t.id, tabName)) ||
                possibleTabs.find(t => this.stringsEqual(t.name, tabName)) ||
                possibleTabs.find(t => this.stringsEqual(t.label, tabName)) ||
                this.tabs.find(t => t.id === this.activeLayout.tabs[0]);
            if (!chosenTab) {
                const tabs = this.tabs.filter(t => this.stringsEqual(t.label, tabName));
                if (tabs.length === 1) {
                    chosenTab = tabs[0];
                } else {
                    chosenTab = this.tabs.find(t => this.stringsEqual(t.name, tabName));
                }
            }
            const tabExistsInLayout =
                tabName && chosenTab ? this.activeLayout.tabs.indexOf(chosenTab.id) !== -1 : null;
            if (!tabExistsInLayout) {
                isLayoutRefresh = true;
                const tabId = this.activeLayout.tabs[0] || LayoutDefaults.tabs[0].id;
                if (tabId) {
                    chosenTab = this.tabs.find(t => t.id === tabId);
                }
            }

            // Screen often 0 loads before other screens - other screens do not get the local storage message
            // to build their own screen active tab map because they have not loaded yet. This ensures that
            // screens will get the correct active tab map by sending a message to other tabs to resend their current active tab.
            if (SCREEN_NUMBER !== 0) {
                this.resendActiveTab();
            }

            this.activeTab = chosenTab;
            setActiveTab(this.activeTab);
            const shouldRefresh = isLayoutRefresh || !chosenTab;
            if (!shouldRefresh) {
                this.isLoadingTab = false;
            }
            this.buildActiveTabList();
            this.setEventBoardFilterInLocalStorage();
            this.setUnitBoardFilterInLocalStorage();

            this.navigateToTab(chosenTab, shouldRefresh);

            // If not find 'DEFAULT_TAB_OMU_MY_EVENT' tab in the active layout tab,
            // look for the tab has 'SELECTED_EVENTS_VIEW' in the stringify to set the My Event Tab Name.
            // This code came from mobileUnitUpdated() function in mainController.ts file.
            if (this.activeLayout.tabs.indexOf(this.myEventTabName) === -1) {
                this.myEventTabName = this.findTabWithViewName(this.selectedEventViewName);
                if (IS_MOBILE_UNIT) {
                    if (
                        _.isNil(this.myEventTabName) &&
                        !_.isNil(this.activeTabs) &&
                        this.activeTabs.length > 0
                    ) {
                        this.myEventTabName = this.findActiveTabNameWithViewName(
                            this.selectedEventViewName
                        );
                        if (!_.isNil(this.myEventTabName)) {
                            this.setDisabledMyEventTab();
                        }
                    }
                }
                console.log(
                    `SingleScreen.setInitialState: set myEventTabName = ${this.myEventTabName}`
                );
            }

            if (this.activeLayout.tabs.indexOf(this.myPatrolTabName) === -1) {
                this.myPatrolTabName = this.findTabWithViewName(this.patrolViewName);
                console.log(
                    `SingleScreen.setInitialState: set myPatrolTabName = ${this.myPatrolTabName}`
                );
            }
        }
    };

    /**
     * For a given layout, find whether there is some tab that exists in it
     * where either its id, name, or label (localized or not) matches a given identifier
     */
    public tabExistsInLayoutByNameOrId = (layout: Layout.V1_0_0.Layout, tabIdentifier: string) => {
        const matchingTabs = this.tabs.filter(
            t =>
                this.stringsEqual(t.id, tabIdentifier) ||
                this.stringsEqual(t.name, tabIdentifier) ||
                this.stringsEqual(t.label, tabIdentifier)
        );

        return matchingTabs.some(t => layout.tabs.indexOf(t.id) !== -1);
    };

    public onLayoutChange = (layout: Layout.V1_0_0.Layout) => {
        this.isLoadingTab = true;
        this.collectUrlParams();
        let queryString = `?layout=${layout.id}`;
        const ws = this.urlParams['workspace'];
        if (ws) {
            let workspace = this.findById(this.workspaces, ws);
            if (!workspace) {
                workspace = this.findByName(this.workspaces, ws);
            }
            if (workspace) {
                queryString += `&workspace=${workspace.id}`;
            }
        } else if (this.activeWorkspace) {
            queryString += `&workspace=${this.activeWorkspace.id}`;
        }

        const tab = this.urlParams['tab'];
        let foundTab: LayoutTab.V2_0_0.LayoutTab;
        if (tab) {
            foundTab = this.findById(this.tabs, tab);
            if (!foundTab) {
                foundTab = this.findByName(this.tabs, tab);
            }
            if (foundTab) {
                queryString += `&tab=${foundTab.id}`;
            } else {
                foundTab = this.activeTab;
            }
        } else if (this.activeTab) {
            foundTab = this.activeTab;
            queryString += `&tab=${this.activeTab.id}`;
        }

        const url = window.location.pathname + queryString;
        if (SHELL_IPC) {
            SHELL_IPC.send('change-layout-mgr-state', {
                screen: SCREEN_NUMBER,
                layout: layout.id,
                tab: foundTab.id
            });
        }

        const screenNumber = _.isNumber(SCREEN_NUMBER) ? SCREEN_NUMBER : 0;
        this.saveWorkspaceLayoutTabConfig(foundTab.id, layout.id, screenNumber);
        this.$location.url(url).replace();
        this.$timeout(() => this.setInitialState(layout.id, foundTab ? foundTab.id : tab, true), 0);
    };

    public onWorkspaceChange = (workspace: string) =>
        new Promise<void>((resolve, reject) => {
            //TODO - Remove `if` guard once we migrate from Electron

            unregisterForWindowUnload();
            //When change role command is executed from any of the secondary windows, stop closing the secondary windows
            //if secondary windows are closed, reloadAllWindows() method never gets called and hence primary window session is not refreshing
            //reloadAllWindows() from ChangeRoleHandler is taking care of closing the secondary windows and refreshing the session of primary window
            //when the primary window session is refreshed, role change will also reflect in the system, else it won't.
            if (!IS_IN_SHELL && SCREEN_NUMBER === 0) {
                closeAllWindows();
            }
            this.isLoadingTab = true;
            this.collectUrlParams();
            // clear map of active tabs in LayoutService.ts
            clearScreenActiveTapMap();
            // send local storage message so other windows can clear the map
            deleteLocalStorageItem('clear-screen-active-tab');
            setLocalStorageItem('clear-screen-active-tab', '');
            this.disabledTabNames.forEach(tab => this.removeFromDisableTabName(tab));
            const ws = this.workspaces.find(
                w => w.id === workspace || this.stringsEqual(w.name, workspace)
            );
            if (ws) {
                const screenNumber = _.isNumber(SCREEN_NUMBER) ? SCREEN_NUMBER : 0;
                const layouts = ws.screens[screenNumber].layouts;
                if (!_.isEmpty(layouts)) {
                    this.$scope.$applyAsync(async () => {
                        this.settings.workspaceId = workspace;
                        this.activeWorkspace = ws;
                        this.settings.screens = ws.screens.map((screen, i) => {
                            const screenSetting = new UserScreenSetting.V2_0_0.UserScreenSetting();
                            let layoutId = screen.layouts.find(l => l === this.activeLayout.id);
                            if (!layoutId) {
                                layoutId = screen.layouts[0];
                            }
                            const screenLayout: Layout.V1_0_0.Layout = this.layouts.find(
                                l => l.id === layoutId
                            );
                            screenSetting.layoutId = screenLayout.id;
                            screenSetting.screenId = screen.id;
                            screenSetting.workspaceId = this.settings.workspaceId;
                            let tabId = screenLayout.tabs.find(t => t === this.activeTab.id);
                            if (!tabId) {
                                tabId = screenLayout.tabs[0];
                            }
                            screenSetting.tabId = tabId;
                            return screenSetting;
                        });
                        const screenNum = _.isNumber(SCREEN_NUMBER) ? SCREEN_NUMBER : 0;
                        this.activeScreen = this.activeWorkspace?.screens[screenNum];
                        this.activeLayout = this.findById(
                            this.layouts,
                            this.settings.screens[screenNum].layoutId
                        );
                        this.setScreenInfo(screenNum);
                        setActiveLayout(this.activeLayout);
                        this.buildActiveTabList();
                        if (IS_MOBILE_UNIT) {
                            this.setMyEventTabNameIfUndefined('onWorkspaceChange');
                        }
                        await this.saveSettingsAfterChange();
                        const layoutId = layouts[0];
                        const layout = this.findById(this.layouts, layoutId);
                        const layoutParam = layout ? this.getString(layout.id) : layoutId;
                        const tabIndex = layout.tabs.indexOf(this.activeTab.id);
                        const tab = tabIndex === -1 ? layout.tabs[0] : layout.tabs[tabIndex];
                        const queryString = `?workspace=${ws.id}&layout=${encodeSpecialChars(
                            layoutParam
                        )}`;
                        const url = window.location.pathname + queryString;
                        this.$location.url(url).replace();
                        //TODO - Remove `!isInShell` condition once we migrate from Electron
                        if (
                            !IS_IN_SHELL &&
                            (this.offerToOpenOtherTabs || this.openOtherTabs) &&
                            ws &&
                            ws.screens &&
                            ws.screens.length > 1
                        ) {
                            window.location.hash = url;
                            window.location.reload();
                        }
                        this.$timeout(() => this.setInitialState(layoutId, tab, true), 0);
                        resolve();
                    });
                } else {
                    console.error(`No layouts are defined for workspace: ${workspace}`);
                    reject(ChangeWorkspaceErrorType.NoLayouts);
                }
            } else {
                console.error(`Cannot find workspace definition: ${workspace}`);
                reject(ChangeWorkspaceErrorType.CannotFindWorkspace);
            }
        });

    public refreshAvailableFeeds = (): Promise<any> => {
        return this.FeedService.getNames(this.configurableFeedType).then(names => {
            _.forEach(names, nameInfo => {
                nameInfo.name = nameInfo.name.replace(this.configurableFeedType, '');
            });
            this.$scope.$applyAsync(() => (this.availableFeeds = names));
            return;
        });
    };

    public feedsChanged = (name: string) => this.refreshAvailableFeeds();

    public deleteFeed = (feed: FeedNameInfo.V1_0_0.FeedNameInfo) => {
        this.FeedService.delete(this.configurableFeedType, feed);
    };

    public openOtherWorkspaceWindows = () => {
        this.workspaceWindowsToOpen.forEach((w, i) => {
            createSingletonWindow(
                window.document.title + ' ' + i,
                null,
                w,
                window.document.title + ' ' + i,
                false
            );
        });
        this.openOtherTabs = true;
        const screenNumber = _.isNumber(SCREEN_NUMBER) ? SCREEN_NUMBER : 0;
        this.setScreenInfo(screenNumber);
        this.saveSettingsAfterChange();
    };

    public cancelOpenOtherWorkspaceWindows = () => {
        this.openOtherTabs = false;
        const screenNumber = _.isNumber(SCREEN_NUMBER) ? SCREEN_NUMBER : 0;
        this.setScreenInfo(screenNumber);
        this.saveSettingsAfterChange();
    };

    public toggleOfferToOpen = (e: React.ChangeEvent<HTMLInputElement>) => {
        const checked = e.target.checked;
        this.$scope.$applyAsync(() => {
            this.offerToOpenOtherTabs = !checked;
        });
    };

    public openWebHelp = () => {
        this.isOpenHelp = !this.isOpenHelp;
        document.addEventListener('click', this.handleClickOutside);
    };

    private handleClickOutside = (e: MouseEvent) => {
        const t = e.target as HTMLElement;
        const target = t.closest('.dropdown.help-dropdown');
        if (!target) {
            this.isOpenHelp = false;
        }
    };

    public openDispatcherHelp = () => {
        this.isOpenHelp = false;
        openHelp();
    };

    public openAddOnHelp = (fileName: string) => {
        this.isOpenHelp = false;
        openAddOnHelp(fileName);
    };

    public adHocTimersButton = (showAdHocTimersPanel = !this.adHocTimersPanelVisible) => {
        if (this.adHocTimersPanelVisible !== showAdHocTimersPanel) {
            this.adHocTimersPanelVisible = showAdHocTimersPanel;
            this.$scope.$root.$broadcast(
                'ad-hoc-timers-menu-' + (this.adHocTimersPanelVisible ? 'on' : 'off')
            );
            if (this.adHocTimersPanelVisible) {
                this.hideDocksInDirection(
                    IS_RTL ? DockDirection.Left : DockDirection.Right,
                    DOCK_HIDE_DIRECTIONS['AD_HOC_TIMERS_PANEL'],
                    'AD_HOC_TIMERS_PANEL'
                );
            }
        }
    };

    public navBarScrollHandle(side: string) {
        const shift = 50;
        const navbar = document.getElementById('navtabsul');
        const btnNavBarLeft = document.getElementById('btnNavBarLeft');
        const btnNavBarRight = document.getElementById('btnNavBarRight');

        if (side === 'Left') navbar.scrollLeft += -shift;
        else if (side === 'Right') navbar.scrollLeft += +shift;

        //For checking if the scroll has ended
        if (Math.floor(navbar.scrollWidth - Math.ceil(navbar.scrollLeft)) <= navbar.offsetWidth) {
            this.scrolEnd = true;
        } else {
            this.scrolEnd = false;
        }
        btnNavBarRight.style.display = this.scrolEnd ? 'none' : '';
        btnNavBarLeft.style.display = navbar.scrollLeft <= 0 ? 'none' : '';
    }
    public toggleNotificationMenu = (showNotificationsPanel = !this.notificationsPanelVisible) => {
        if (this.notificationsPanelVisible !== showNotificationsPanel) {
            this.notificationsPanelVisible = showNotificationsPanel;
            this.$scope.$root.$broadcast(
                'notification-menu-' + (this.notificationsPanelVisible ? 'on' : 'off')
            );
            if (this.notificationsPanelVisible) {
                this.hideDocksInDirection(
                    IS_RTL ? DockDirection.Left : DockDirection.Right,
                    DOCK_HIDE_DIRECTIONS['NOTIFICATIONS_PANEL'],
                    'NOTIFICATIONS_PANEL'
                );
            }
        }
    };

    public settingsChangedCallback = (
        settings: UserWorkspaceSetting.V2_0_0.UserWorkspaceSetting
    ) => {
        if (userWorkspaceSettingsAreValid(settings)) {
            this.settings = settings;
            this.offerToOpenOtherTabs = settings.showOpenMultipleScreensModal;
            this.openOtherTabs = settings.openMultipleScreensInBrowser;
            this.saveSettingsAfterChange();
        }
    };

    public renderOpenNewTabsModal = props => {
        return (
            <Fragment>
                <h2>{this.willOpenNewTabsPrompt}</h2>
                <label
                    className="modal-checkbox-label flex-row flex-align-center"
                    htmlFor="toggle-offer-to-open">
                    <input
                        id="toggle-offer-to-open"
                        type="checkbox"
                        onChange={e => this.toggleOfferToOpen(e)}
                    />
                    <span>{getString('DO_NOT_SHOW_IN_FUTURE')}</span>
                </label>
                <div className="flex-row">
                    <button
                        className="ui-button primary-button"
                        style={{ minWidth: 100 }}
                        onClick={() => this.openOtherWorkspaceWindows()}>
                        {getString('YES')}
                    </button>
                    <button
                        className="ui-button"
                        style={{ minWidth: 100 }}
                        autoFocus
                        onClick={() => this.cancelOpenOtherWorkspaceWindows()}>
                        {getString('NO')}
                    </button>
                </div>
            </Fragment>
        );
    };

    public saveSettingsAfterChange = async () => {
        this.workspaceWindowsToOpen = [];
        this.showWillOpenNewTabsModal = false;
        this.settings = this.settings || new UserWorkspaceSetting.V2_0_0.UserWorkspaceSetting();
        this.settings.showOpenMultipleScreensModal = this.offerToOpenOtherTabs;
        this.settings.openMultipleScreensInBrowser = this.openOtherTabs;
        if (this.settings.workspaceId != this.activeWorkspace.id) {
            if (this.activeWorkspace) {
                this.settings.workspaceId = this.activeWorkspace.id;
                this.settings.screens = this.activeWorkspace.screens.map((sc, i) => {
                    const screenSetting = new UserScreenSetting.V2_0_0.UserScreenSetting();
                    screenSetting.layoutId = sc.layouts[0];
                    const layout = this.findById(this.layouts, sc.layouts[0]);
                    screenSetting.screenId = sc.id;
                    screenSetting.workspaceId = this.settings.workspaceId;
                    if (layout) {
                        screenSetting.tabId = layout.tabs[0] || '';
                    }
                    return screenSetting;
                });
            }
        }
        await this.saveSettings();
    };

    public saveSettings = () => {
        const request = new SetUserWorkspaceSetting.V1_0_0.SetUserWorkspaceSettingRequest();
        request.settings = this.settings;
        setCrossProductLocalStorageItem('user-workspace-settings', this.settings);
        return sendCommand(request);
    };

    public refreshLayouts = (layouts: Layout.V1_0_0.Layout[]) => {
        this.layouts = layouts;
        this.activeLayout = this.activeLayout || this.layouts[0];
        setActiveLayout(this.activeLayout);
        this.buildActiveTabList();
        if (IS_MOBILE_UNIT) {
            this.setMyEventTabNameIfUndefined('refreshLayouts');
        }
    };

    public toggleSideMenu = () => {
        //representing the command line that is docked on a layout
        const cmdLine = document.querySelector(
            `.docked-view[data-view-key="COMMAND_LINE_VIEW"]`
        ) as HTMLElement;

        //representing the command line that is not docked on a layout
        const cmdLine2 = document.querySelector(
            `:not(.docked-view) > command-line[view-key="'COMMAND_LINE_VIEW'"]`
        ) as HTMLElement;

        //representing the custom widget that is docked on a layout
        const mapOptions: HTMLElement = document.querySelector('.map-options-wrapper');
        const dir =
            (this.activeDockedViews[0]?.settings[0] as IViewSetting)?.defaultValueParsed
                ?.direction || 'right';
        const customWidgetPanel = document.getElementsByClassName(`docked-views-${dir}`)[0]
            ?.children[0]?.children[0]?.children[0] as HTMLElement;
        this.isShowingSideMenu = !this.isShowingSideMenu;
        this.isTransitioningSideMenu = true;
        if (this.isShowingSideMenu) {
            if (this.widgetPanelOpen) {
                if (dir === 'right') {
                    customWidgetPanel.style.transform = 'translateX(-400px)';
                }
                if (dir === 'left') {
                    if (this.eventPanelVisible || this.unitPanelVisible) {
                        customWidgetPanel.style.transform = 'translateX(930px)';
                        mapOptions.style.transform = 'translateX(930px)';
                    } else {
                        customWidgetPanel.style.transform = 'translateX(430px)';
                        mapOptions.style.transform = 'translateX(430px)';
                    }
                }
            }
        } else if (!this.isShowingSideMenu) {
            if (this.widgetPanelOpen) {
                if (dir === 'right') {
                    customWidgetPanel.style.transform = 'translateX(0px)';
                }
                if (dir === 'left') {
                    if (this.eventPanelVisible || this.unitPanelVisible) {
                        customWidgetPanel.style.transform = 'translateX(930px)';
                        mapOptions.style.transform = 'translateX(930px)';
                    } else {
                        customWidgetPanel.style.transform = 'translateX(430px)';
                        mapOptions.style.transform = 'translateX(430px)';
                    }
                }
            }
        }

        if (cmdLine) {
            if (this.isShowingSideMenu) {
                this.cmdLineWidth = cmdLine.style.width || '100%';
                cmdLine.style.width = `calc(${this.cmdLineWidth} - 400px)`;
            } else if (!this.isShowingSideMenu) {
                cmdLine.style.width = this.cmdLineWidth;
            }
        }
        if (cmdLine2) {
            if (this.isShowingSideMenu) {
                this.cmdLineWidth2 = cmdLine2.style.width || '100%';
                cmdLine2.style.width = `calc(${this.cmdLineWidth2} - 400px)`;
            } else if (!this.isShowingSideMenu) {
                cmdLine2.style.width = this.cmdLineWidth2;
            }
        }
        if (this.isShowingSideMenu) {
            const commandMenu = document.querySelector('#menu-body');
            commandMenu?.classList.add('cd-command-menu');
        } else {
            const commandMenu = document.querySelector('#menu-body');
            commandMenu?.classList.remove('cd-command-menu');
        }
    };

    public closeSideMenu = () => {
        this.isShowingSideMenu = false;
        this.isTransitioningSideMenu = true;

        //representing the command line that is docked on a layout
        const cmdLine = document.querySelector(
            `.docked-view[data-view-key="COMMAND_LINE_VIEW"]`
        ) as HTMLElement;

        //representing the command line that is not docked on a layout
        const cmdLine2 = document.querySelector(
            `:not(.docked-view) > command-line[view-key="'COMMAND_LINE_VIEW'"]`
        ) as HTMLElement;

        if (cmdLine && this.cmdLineWidth) {
            cmdLine.style.width = this.cmdLineWidth;
        } else if (cmdLine2 && this.cmdLineWidth2) {
            cmdLine2.style.width = this.cmdLineWidth2;
        }

        const commandMenu = document.querySelector('#menu-body');
        commandMenu?.classList.remove('cd-command-menu');
    };

    public setLayout = (layout: Layout.V1_0_0.Layout) => {
        this.activeLayout = layout;
        setActiveLayout(this.activeLayout);
        this.buildActiveTabList();
        if (IS_MOBILE_UNIT) {
            this.setMyEventTabNameIfUndefined('setLayout');
        }
        this.navigateToTab(this.activeTabs[0]);
    };

    public navigateToTab = (tab: LayoutTab.V2_0_0.LayoutTab, forceRefresh?: boolean) => {
        if (
            !(tab.id === this.activeTab.id) ||
            (forceRefresh &&
                !_.isEmpty(this.views) &&
                !_.isEmpty(this.layouts) &&
                !_.isEmpty(this.tabs) &&
                !!this.activeTab)
        ) {
            this.isLoadingTab = true;
            this.collectUrlParams();
            let queryString = `?tab=${encodeSpecialChars(
                this.getString(tab.label || tab.name || tab.id)
            )}`;
            const ws = this.urlParams['workspace'];
            if (ws) {
                queryString += `&workspace=${encodeSpecialChars(ws)}`;
            }

            let urlLayout = this.urlParams['layout'];
            const foundLayout =
                this.findById(this.layouts, urlLayout) || this.findByName(this.layouts, urlLayout);
            urlLayout = foundLayout
                ? this.getString(foundLayout.name || foundLayout.id)
                : urlLayout;
            if (urlLayout) {
                queryString += `&layout=${encodeSpecialChars(urlLayout)}`;
            }

            const url = window.location.pathname + queryString;
            this.$location.url(url).replace();

            if (!this.activeLayout) {
                const layout = _.find(this.layouts, layout =>
                    _.some(layout.tabs, t => t === tab.id)
                );

                if (layout) {
                    this.activeLayout = layout;
                    this.buildActiveTabList();
                    if (IS_MOBILE_UNIT) {
                        this.setMyEventTabNameIfUndefined('navigateToTab');
                    }
                }
            }

            this.activeTab = tab;
            getParameterFromList('UISettings', 'DisplayWindowNameAsSelectedTab', 'OnCall')
                .then(res => {
                    const displayWindowNameAsSelTab = _.isBoolean(res) ? res : !!parseInt(res);
                    const label = tab.label || tab.name;

                    const titleStringKey = IS_SECURITY_GUARDIAN
                        ? 'WEB_SECGUARDIAN_TITLE'
                        : IS_MOBILE_UNIT
                        ? 'MOBILE_UNIT_TITLE'
                        : 'WEB_DISP_TITLE';
                    const tabTitleStringKey = IS_SECURITY_GUARDIAN
                        ? 'OCSECGUARDIAN_TAB_TITLE'
                        : IS_MOBILE_UNIT
                        ? 'MOBILE_UNIT_TAB_TITLE'
                        : 'OCDISP_TAB_TITLE';

                    needStrings([label]).then(() => {
                        if (displayWindowNameAsSelTab) {
                            document.title = getStrings(
                                tabTitleStringKey,
                                getIfNotLocalized(label)
                            );
                        } else {
                            document.title = getString(titleStringKey);
                        }
                    });
                })
                .catch(err => {
                    console.error(err);
                });

            // set activeTab in LayoutService.ts
            setActiveTab(tab);
            // set map of active tabs in LayoutService.ts
            const sat = new ScreenActiveTab(SCREEN_NUMBER, tab);
            setScreenActiveTabMap(sat.screen, sat.activeTab);
            // send local storage message so other windows can update the map
            deleteLocalStorageItem('set-screen-active-tab');
            setLocalStorageItem('set-screen-active-tab', sat);

            setLocalStorageItem('active-tab', this.activeTab);
            if (SHELL_IPC) {
                SHELL_IPC.send('change-layout-mgr-state', {
                    screen: SCREEN_NUMBER,
                    layout: this.activeLayout.id,
                    tab: tab.id
                });
            } else if (
                this.settings &&
                this.settings.screens &&
                this.settings.screens[SCREEN_NUMBER]
            ) {
                this.saveWorkspaceLayoutTabConfig(tab.id);
            }
            this.$timeout(() => this.compileTab(tab), 0);
        }
        this.isShowingLayoutManager = false;
        this.isShowingSideMenu = false;
    };

    public saveWorkspaceLayoutTabConfig = (tabId: any, layoutId?: any, screenNumber?: number) => {
        let index: number;
        index = screenNumber ? screenNumber : SCREEN_NUMBER;
        const request = new Msg.GetUserWorkspaceSetting.V1_0_0.GetUserWorkspaceSettingRequest();
        sendCommand(request)
            .then(rsp => {
                if (rsp.mhdr.response.success) {
                    var resultData =
                        rsp.body as Msg.GetUserWorkspaceSetting.V1_0_0.GetUserWorkspaceSettingResponse;
                    if (resultData.settings) {
                        this.settings = resultData.settings;
                    }
                    this.settings.screens[index].tabId = tabId;
                    this.settings.screens[index].layoutId = layoutId
                        ? layoutId
                        : this.activeLayout.id;
                    this.settings.screens[index].workspaceId = this.settings.workspaceId;
                    this.saveSettings();
                }
            })
            .catch(error => {
                console.log('Failed to retrive latest config and update');
            });
    };

    public navigateToTabByName = (tabName: string, forceRefresh?: boolean): Promise<void> =>
        new Promise((resolve, reject) => {
            const tab = this.findByName(this.tabs, tabName);
            if (tab) {
                StateService.executeSaveStateCallbacks().then(() =>
                    this.navigateToTab(tab, forceRefresh)
                );
                resolve();
            } else {
                reject('NoTabFound');
            }
        });

    public navigateToTabById = (tabId: string, forceRefresh?: boolean): Promise<void> =>
        new Promise((resolve, reject) => {
            const tab = this.tabs.find(t => t.id === tabId);
            if (tab) {
                // To make a tab disable, skip the process if disabledTabNames contains the passed-in tabId
                if (this.disabledTabNames.indexOf(tabId) === -1) {
                    StateService.executeSaveStateCallbacks().then(() => {
                        this.navigateToTab(tab, forceRefresh);
                        resolve();
                    });
                    onTabSwitch();
                }
            } else {
                reject('NoTabFound');
            }
        });

    public getString = (key: string) => {
        return getIfNotLocalized(key);
    };

    public stringsEqual = (str1: string, str2: string) => {
        return str1 === str2 || getIfNotLocalized(str1) === getIfNotLocalized(str2);
    };

    // Find Tab, Layout, or Workspace in an array, by name
    public findByName = <T extends {}>(arr: T[], name: string): T => {
        return arr.find(item => item && this.stringsEqual(item['name'], name));
    };

    public findById = <T extends {}>(arr: T[], id: string): T => {
        return arr.find(item => item && item['id'] === id);
    };

    public findByType = <T extends {}>(arr: T[], type: string): T => {
        return arr.find(item => item && item['type'] === type);
    };

    public findItemNameById = <T extends {}>(arr: T[], id: string): string => {
        const item = arr.find(item => item && item['id'] === id);
        return item ? item['name'] : null;
    };

    private compileTab = async (tab: LayoutTab.V2_0_0.LayoutTab) => {
        this.isLoadingTab = true;
        const allViews = getUniqueViewsInTab(tab);
        let displayContactDirectory = await getParameterFromList(
            'UISettings',
            'DisableContactDirectory',
            'OnCall'
        );
        this.showContactDirectoryIcon = !(
            displayContactDirectory === '1' || displayContactDirectory?.toUpperCase() === 'Y'
        );
        const legacyCustomViews = allViews.filter(v => v.nonAngular && _.isNil(v.isCustomView));

        const cssFiles: { src: string; version: string }[] = [];
        const preloadScripts: { src: string; version: string }[] = [];
        const postloadScripts: { src: string; version: string }[] = [];

        legacyCustomViews.forEach(v => {
            if (!_.isEmpty(v.preloadScripts)) {
                v.preloadScripts.forEach(sc => {
                    if (preloadScripts.some(ps => ps.src === sc)) {
                        preloadScripts.push({
                            src: sc,
                            version: v.version
                        });
                    }
                });
            }
            if (!_.isEmpty(v.postloadScripts)) {
                v.postloadScripts.forEach(sc => {
                    if (!postloadScripts.some(ps => ps.src === sc)) {
                        postloadScripts.push({ src: sc, version: v.version });
                    }
                });
            }
            if (!_.isEmpty(v.cssFiles)) {
                v.cssFiles.forEach(cssFile => {
                    if (!cssFiles.some(cf => cf.src === cssFile)) {
                        cssFiles.push({ src: cssFile, version: v.version });
                    }
                });
            }
        });

        // Must use jQuery here with the CompileService
        const rows = Array.from(
            document.querySelectorAll('.single-screen-main > .flex-col .flex-row')
        ) as HTMLElement[];
        rows.forEach(el => {
            Array.from(el.children).forEach(this.destroyElementScope);
        });

        // Empty all docked views
        Array.from(document.querySelectorAll('.docked-view')).forEach(wrapperEl => {
            if (wrapperEl?.childElementCount === 1) {
                ReactDOM.unmountComponentAtNode(wrapperEl.firstChild as HTMLElement);
            }
        });
        Array.from(document.querySelectorAll('.docked-views-container')).forEach(
            c => (c.innerHTML = '')
        );

        preloadScripts.forEach(({ src, version }) => {
            const el = document.createElement('script');
            el.src = `${src}?v=${BUILD_VERSION}${version || ''}`;
            document.body.appendChild(el);
        });

        cssFiles.forEach(({ src, version }) => {
            const el = document.createElement('link');
            el.rel = 'stylesheet';
            el.type = 'text/css';
            el.href = `${GLOBAL_BASE_URL}${src}?v=${BUILD_VERSION}${version || ''}`;
            document.head.appendChild(el);
        });

        try {
            Array.from(document.querySelectorAll('.react-placeholder-parent')).forEach(
                ReactDOM.unmountComponentAtNode
            );

            const html = await this.buildTab();
            this.navBarScrollHandle('onLoad');
            //TODO Get rid of $ once fully converted to React
            $('.single-screen-main').empty().append(html);

            this.reactElements.forEach(el => {
                const placeholder = document.querySelector(`[data-guid="${el.guid}"]`);
                if (placeholder) {
                    const parent = placeholder.parentElement;
                    parent.removeChild(placeholder);
                    ReactDOM.render(el.element, parent);
                }
            });

            const dockPromises = this.dockedViews.map(view => {
                const fixedWidthSetting: IViewSetting = view.settings.find(
                    s => s.property === 'fixedWidth'
                );
                let width = '100%';
                if (fixedWidthSetting && fixedWidthSetting.defaultValueParsed) {
                    width = fixedWidthSetting.defaultValueParsed;
                }
                const dockSetting: IViewSetting = view.settings.find(s => s.property === 'docked');
                const dockDirection: DockDirection =
                    dockSetting?.defaultValueParsed?.direction || DockDirection.Top;
                const dockedViewsContainer = document.querySelector(
                    `.docked-views-container.docked-views-${dockDirection}`
                );
                const useShortcut = !!dockSetting?.defaultValueParsed?.useShortcut;
                const shortcutKeys = dockSetting?.defaultValueParsed?.shortcutKeys;

                if (useShortcut && !_.isEmpty(shortcutKeys)) {
                    this.dockKeyboardShortcuts[view.key] = shortcutKeys;
                    console.debug(
                        `[Keyboard Shortcuts]: ${this.getString(
                            view.key
                        )} registered the shortcut: ${shortcutKeys.join(' + ')}`
                    );
                }

                if (dockedViewsContainer) {
                    // Must use jQuery here with CompileService
                    return this.buildDockedViewTag(view).then(html => {
                        //TODO Get rid of $ once fully converted to React
                        const el = _.first(this.$compile(html)(this.$scope.$new()));
                        el.style.display = 'none';
                        el.style.transition = 'transform 300ms ease-in-out';
                        dockedViewsContainer.appendChild(el);
                        if (view.react) {
                            const reactEl = this.reactElements.find(
                                r => r.guid === view.savedStateGuid
                            );
                            const placeholder = document.querySelector(
                                `[data-guid="${view.savedStateGuid}"]`
                            );
                            if (placeholder && reactEl) {
                                const parent = placeholder.parentElement;
                                parent.removeChild(placeholder);
                                ReactDOM.render(reactEl.element, parent);
                            }
                        }
                        //if a docked view was open on previous tab, keep open on this new tab
                        if (this.isDockedViewActive(view)) {
                            this.setDockedViewActiveValue(view, true, true);
                        }
                    });
                } else {
                    return Promise.resolve();
                }
            });

            await Promise.all(dockPromises);
        } finally {
            postloadScripts.forEach(({ src, version }) => {
                const el = document.createElement('script');
                el.src = `${src}?v=${BUILD_VERSION}${version || ''}`;
                document.body.appendChild(el);
            });

            this.$scope.$applyAsync(() => {
                this.isLoadingTab = false;
                this.reactElements = [];
                viewLoaded();
            });
        }
    };

    private destroyElementScope = (childEl: Element) => {
        const elScope: ng.IScope = angular.element(childEl).scope();
        if (elScope && _.isFunction(elScope.$destroy)) {
            elScope.$destroy();
        }
    };

    private buildTab = () =>
        new Promise<ng.IAugmentedJQuery>((resolve, reject) => {
            this.arrayArgs = [];
            this.dockedViews = [];
            this.dockKeyboardShortcuts = {};
            this.dockBadgeNumbers = {};
            this.dockIconStyles = {};
            this.pressedKeys = [];
            this.newKeyPress = true;

            Promise.all(
                this.activeTab.columns.map(c => {
                    return this.getRows(c).then(
                        rowHtml =>
                            `<div class="flex-col" style="width: ${c.width}%;">${rowHtml.join(
                                ''
                            )}</div>`
                    );
                })
            ).then(columnsHtml => {
                try {
                    const html = this.$compile(columnsHtml.join(''))(this.$scope.$new());
                    resolve(html);
                } catch (e) {
                    reject(e);
                }
            });
        });

    private getRows = (column: LayoutTabColumn.V2_0_0.LayoutTabColumn) => {
        return Promise.all(
            column.rows.map(r => {
                const dockedRow = getDockedView(r);
                const unDockedRow = getUnDockedView(r);
                if (dockedRow) {
                    this.dockedViews.push(dockedRow.view);
                    return;
                }
                //This is to handle shortcut operations
                if (unDockedRow) {
                    const dockSetting: IViewSetting = unDockedRow.view.settings.find(
                        s => s.property === 'docked'
                    );
                    const useShortcut = !!dockSetting?.defaultValueParsed?.useShortcut;
                    const shortcutKeys = dockSetting?.defaultValueParsed?.shortcutKeys;

                    if (useShortcut && !_.isEmpty(shortcutKeys)) {
                        this.dockKeyboardShortcuts[unDockedRow.view.key] = shortcutKeys;
                    }
                }

                const fixedHeight = getRowFixedHeight(r);
                const h = _.isEmpty(fixedHeight) ? `${r.height}%` : fixedHeight;
                const showBorder = this.shouldShowBorder(r);
                let classStr = `flex-row ${showBorder ? 'bordered' : ''} ${
                    _.isEmpty(fixedHeight) ? 'flex-grow' : ''
                }`;
                const zIndex = r?.view?.key == 'COMMAND_LINE_VIEW' ? 1003 : 404;
                return this.getColumns(r).then(cols => {
                    let colHtml = _.isArray(cols) ? cols.join('') : cols;
                    if (!colHtml) {
                        classStr += ' empty-view';
                        colHtml = `
                        <div class="empty-view-inner">
                            <p>
                                <span>${getString('LAYOUT_MGR_USE_LAYOUT_MGR_PROMPT')}
                                    <a target="_blank" href="${GLOBAL_BASE_URL}Administrator/#!/layout-manager">${getString(
                            'WEB_LAYOUT_MANAGER'
                        )}</a>.
                                </span>
                            </p>
                        </div>
                    `;
                    }
                    return `<div data-saved-state-guid="${
                        r.view?.savedStateGuid
                    }" class="${classStr}" style="height: ${h}; ${
                        _.isEmpty(fixedHeight) ? '' : `z-index:${zIndex} ;`
                    } ">${colHtml}</div>`;
                });
            })
        );
    };

    private getColumns = (row: LayoutTabRow.V2_0_0.LayoutTabRow) => {
        if (_.isEmpty(row.columns) && row.view) {
            return this.buildViewTag(row.view);
        } else {
            return Promise.all(
                row.columns.map(c => {
                    return this.getRows(c).then(rows => {
                        return `<div class="flex-col" style="width: ${c.width}%;">${rows.join(
                            ''
                        )}</div>`;
                    });
                })
            );
        }
    };

    private shouldShowBorder = (row: OrderedCellRow) => {
        if (_.isEmpty(row.columns) && row.view && !_.isEmpty(row.view.settings)) {
            const showBorderSettings: IViewSetting = row.view.settings.find(
                s => s.property === 'showBorder'
            );
            if (showBorderSettings) {
                return !!showBorderSettings.defaultValueParsed;
            }
        }

        return false;
    };

    private dismissDockedView = (viewKey: string) => {
        const view = this.activeDockedViews.find(v => v.key === viewKey);
        if (view) {
            this.toggleDockedView(view);
        }
    };

    /*
     * Set the Docked View to Active or Inactive based on the inputted "activeValue".
     * If activeValue is true, set the Docked View to active. Else, set the docked view to not active.
     */
    private setDockedViewActiveValue = (
        view: LayoutView.V2_0_0.LayoutView,
        activeValue: boolean,
        tabReload?: boolean
    ) => {
        if (this.isAnimatingDock) {
            return;
        }

        let geofenceEditorDiv: HTMLElement = document.querySelector(
            '.geofence-editor-panel-is-open'
        );
        let cmdLineClosed: HTMLElement = document.querySelector(
            '.docked-view.ng-scope.cmd-line-closed'
        );
        let cmdLine: HTMLElement = document.querySelector('.docked-view.ng-scope');
        let cmdLineOpen: HTMLElement = document.querySelector('.docked-view.ng-scope.is-open');
        let mapOption: HTMLElement = document.querySelector(
            '.map-filter-status-ribbon-container'
        )?.parentElement;
        let shiftWidth: boolean = mapOption?.getBoundingClientRect().top <= 70;
        if (mapOption) {
            if ((cmdLine || cmdLineClosed) && shiftWidth) {
                mapOption.style.top = '45px';
            }
            if (cmdLineOpen) {
                mapOption.style.setProperty('top', '1rem');
            }
        }
        if (geofenceEditorDiv) {
            if ((cmdLine || cmdLineClosed) && shiftWidth) {
                geofenceEditorDiv.style.setProperty('top', '46px');
            }
            if (cmdLineOpen) {
                geofenceEditorDiv.style.setProperty('top', '0');
            }
        }
        let geofenceViewerDiv: HTMLElement = document.querySelector(
            '.geofence-viewer-panel-is-open'
        );
        if (geofenceViewerDiv) {
            if (cmdLine || cmdLineClosed) {
                geofenceViewerDiv.style.setProperty('top', '46px');
            }
            if (cmdLineOpen) {
                geofenceViewerDiv.style.setProperty('top', '0');
            }
        }

        // if reload compare keys otherwise check if it is the same object.
        const fixedWidthSetting: IViewSetting = view.settings.find(
            s => s.property === 'fixedWidth'
        );
        let width = '100%';
        if (fixedWidthSetting && fixedWidthSetting.defaultValueParsed) {
            width = fixedWidthSetting.defaultValueParsed;
        }
        const dockSetting: IViewSetting = view.settings.find(s => s.property === 'docked');
        const dockDirection: DockDirection =
            dockSetting?.defaultValueParsed.direction || DockDirection.Top;
        const mapOptions: HTMLElement = document.querySelector('.map-options-wrapper');
        const mapDrawPanel: HTMLElement = document.querySelector('.drawings-view');
        const contactContainer: HTMLElement = document.getElementById(
            'contact-directory-container'
        );
        const calltakerPanel: HTMLElement = document.querySelector('.ct-eventform');
        const dockedpanel: HTMLElement = document.querySelector('.ct-navTabs .contents div.docked');
        const callhandlingPanel: HTMLElement = document.querySelector('.calltaker-call-handling');
        const calltakerAsEventPanel: HTMLElement = document.querySelector(
            '.calltaker-panel-visible'
        );
        const calltakerCompactExpandedPanel: NodeListOf<HTMLElement> = document.querySelectorAll(
            '#CALLTAKER-COMPACT-VIEW2 .event-panel-wrapper.expanded'
        );

        // if there are multiple docked command lines in a layout, toggle all of them
        if (view.key === 'COMMAND_LINE_VIEW' && this.getAmountOfDockedCommandLines() > 1) {
            const els: NodeListOf<HTMLElement> = document.querySelectorAll(
                `[data-view-key="${view.key}"]`
            );
            _.forEach(els, el => {
                this.toggleDockedItem(
                    view,
                    el,
                    activeValue,
                    width,
                    dockDirection,
                    mapOptions,
                    mapDrawPanel,
                    contactContainer,
                    calltakerPanel,
                    dockedpanel,
                    callhandlingPanel,
                    calltakerAsEventPanel,
                    tabReload,
                    calltakerCompactExpandedPanel
                );
            });
        }
        // otherwise toggle the individual docked element
        else {
            const el: HTMLElement = document.querySelector(`[data-view-key="${view.key}"]`);
            this.toggleDockedItem(
                view,
                el,
                activeValue,
                width,
                dockDirection,
                mapOptions,
                mapDrawPanel,
                contactContainer,
                calltakerPanel,
                dockedpanel,
                callhandlingPanel,
                calltakerAsEventPanel,
                tabReload,
                calltakerCompactExpandedPanel
            );
        }

        // When switching tab, set focus to command line input element if command line is opened
        if (view.key === 'COMMAND_LINE_VIEW' && activeValue && tabReload) {
            this.$timeout(() => {
                const cmdLineInput: HTMLElement = document.querySelector('.command-line-input');
                cmdLineInput?.focus();
            }, 800);
        }
    };

    private toggleDockedView = (view: LayoutView.V2_0_0.LayoutView, tabReload?: boolean) => {
        const willShow = !this.isDockedViewActive(view);
        if (view.isCustomView) {
            this.widgetPanelOpen = willShow;
        }
        this.setDockedViewActiveValue(view, willShow, tabReload);
    };

    // switches the desired element between visible and not visible
    private toggleDockedItem = (
        view: LayoutView.V2_0_0.LayoutView,
        el: HTMLElement,
        willShow: boolean,
        width: string,
        dockDirection: DockDirection,
        mapOptions: HTMLElement,
        mapDrawPanel: HTMLElement,
        contactContainer: HTMLElement,
        calltakerPanel: HTMLElement,
        dockedpanel: HTMLElement,
        callhandlingPanel: HTMLElement,
        calltakerAsEventPanel: HTMLElement,
        tabReload?: boolean,
        calltakerCompactExpandedPanel?: NodeListOf<HTMLElement>
    ) => {
        if (willShow) {
            this.animateDockedViewIn(el, mapOptions, dockDirection, width);

            //this.hideDocksInDirection(dockDirection, DOCK_HIDE_DIRECTIONS[view.key]);

            this.activeDockedViews = this.activeDockedViews.concat([view]);
            if (view.key === 'COMMAND_LINE_VIEW') {
                el.classList.add('is-open');
                el.classList.add('cd-tabbable-view');
                el.classList.remove('cmd-line-closed');
                this.commandLineVisible = true;
                const input = document.querySelector('.command-line-input') as HTMLInputElement;
                const shiftMapOptions: boolean = mapOptions?.getBoundingClientRect().top <= 70;
                // if reload don't need to refocus
                if (input && !tabReload) {
                    input.focus();
                }
                if (mapOptions && shiftMapOptions) {
                    mapOptions.style.top = '45px';
                }
                if (mapDrawPanel) {
                    mapDrawPanel.style.top = '45px';
                }
                if (contactContainer) {
                    contactContainer.style.top = '45px';
                }
                if (dockedpanel) {
                    dockedpanel.style.top = '45px';
                }
                if (calltakerPanel) {
                    calltakerPanel.style.top = '45px';
                    let ctBodyHeight = 140;
                    const domCrossRefReference = document.querySelector('.ct-cross-ref');
                    if (!!domCrossRefReference) {
                        let crossRefHeight = domCrossRefReference?.clientHeight;
                        if (crossRefHeight > 40) {
                            ctBodyHeight += 280;
                        } else {
                            ctBodyHeight += 40;
                        }
                    }
                    const heightStyled = `calc(${
                        document.querySelector('calltaker-event-panel')?.clientHeight
                    }px - ${ctBodyHeight}px)`;
                    const ctNavTabsDOM = document.querySelector('.ct-navTabs');
                    const eventPanelNav = document.querySelector(
                        '.ct-navTabs .event-panel-body .event-panel-nav'
                    );
                    const eventPanelContentDOM = document.querySelector(
                        '.ct-navTabs .event-panel-body .event-panel-content'
                    );
                    eventPanelContentDOM['style'].height = heightStyled;
                    ctNavTabsDOM['style'].height = heightStyled;
                    eventPanelNav['style'].height = heightStyled;
                }
                if (calltakerAsEventPanel) {
                    const heightStyled = `calc(${
                        document.querySelector('.calltaker-panel-visible')?.clientHeight
                    }px - ${85}px)`;
                    const ctNavTabsDOM = document.querySelector(
                        '#Calltaker-As-EventPanel .ctEP-navTabs'
                    );
                    const eventPanelContentDOM = document.querySelector(
                        '#Calltaker-As-EventPanel .ctEP-navTabs .event-panel-body .event-panel-content'
                    );
                    eventPanelContentDOM['style'].height = heightStyled;
                    ctNavTabsDOM['style'].height = heightStyled;
                    const calltakerAsEventExpandedPanel: NodeListOf<HTMLElement> =
                        document.querySelectorAll(
                            '#Calltaker-As-EventPanel .event-panel-wrapper.expanded'
                        );
                    if (
                        !!calltakerAsEventExpandedPanel &&
                        calltakerAsEventExpandedPanel?.length > 0
                    ) {
                        if (calltakerAsEventExpandedPanel?.length > 1) {
                            const heightExtendedPanel =
                                calltakerAsEventExpandedPanel?.length === 3 ? 25 : 45;
                            _.forEach(calltakerAsEventExpandedPanel, ele => {
                                const eleHeight = !_.isNaN(
                                    ele.clientHeight -
                                        heightExtendedPanel / calltakerAsEventExpandedPanel?.length
                                )
                                    ? (
                                          ele.clientHeight -
                                          heightExtendedPanel /
                                              calltakerAsEventExpandedPanel?.length
                                      )
                                          .toString()
                                          .concat('px')
                                    : '';
                                if ($(ele).hasClass('first-compact')) {
                                    ele.style.top = '45px';
                                }
                                ele.style.setProperty('height', eleHeight, 'important');
                            });
                        }
                    }
                }
                if (callhandlingPanel) {
                    callhandlingPanel.style.marginTop = '45px';
                }
                if (!!calltakerCompactExpandedPanel && calltakerCompactExpandedPanel?.length > 0) {
                    if (calltakerCompactExpandedPanel?.length == 1) {
                        const ele = calltakerCompactExpandedPanel[0];
                        const eleHeight = !_.isNaN(ele.clientHeight - 45)
                            ? (ele.clientHeight - 45).toString().concat('px')
                            : '';
                        ele.style.top = '45px';
                        ele.style.setProperty('height', eleHeight, 'important');
                    } else {
                        _.forEach(calltakerCompactExpandedPanel, ele => {
                            const eleHeight = !_.isNaN(
                                ele.clientHeight - 45 / calltakerCompactExpandedPanel?.length
                            )
                                ? (ele.clientHeight - 45 / calltakerCompactExpandedPanel?.length)
                                      .toString()
                                      .concat('px')
                                : '';
                            if ($(ele).hasClass('first-compact')) {
                                ele.style.top = '45px';
                            }
                            ele.style.setProperty('height', eleHeight, 'important');
                        });
                    }
                }
                _.forEach(this.dockedViews, d => {
                    if (d.key !== 'COMMAND_LINE_VIEW') {
                        const viewEl: HTMLElement = document.querySelector(
                            `[data-view-key="${d.key}"]`
                        );
                        viewEl.classList.add('pushed');
                        if (this.activeDockedViews.includes(d)) {
                            if (dockDirection === DockDirection.Bottom) {
                                viewEl.style.transform = `translate(${this.getTranslateX(
                                    viewEl
                                )},0px)`;
                            } else {
                                viewEl.style.transform = `translate(${this.getTranslateX(
                                    viewEl
                                )},45px)`;
                            }
                        }
                    }
                });
            } else if (this.dockPanelsToOppositeSide) {
                if (view.key === 'SOP_PANEL') {
                }
            } else {
                const customWidgetPanel = document.getElementsByClassName(
                    `docked-views-${dockDirection}`
                )[0]?.children[0]?.children[0]?.children[0] as HTMLElement;
                if (dockDirection === 'right') {
                    if (this.isShowingSideMenu) {
                        customWidgetPanel.style.transform = 'translateX(-400px)';
                    } else if (!this.isShowingSideMenu && this.widgetPanelOpen) {
                        customWidgetPanel.style.transform = 'translateX(0px)';
                    }
                }
            }
            this.isAnimatingDock = false;
        } else {
            // If a docked command line was collapsed that means the user is no longer interested in keeping the value. Remove it.
            if (view.key === 'COMMAND_LINE_VIEW') {
                this.commandLineVisible = false;
                const savedStateKey = SavedStateTypes.CommandLine;
                StateService.clearStateData(savedStateKey);

                if (el) {
                    el.classList.remove('is-open');
                    el.classList.remove('cd-tabbable-view');
                    el.classList.add('cmd-line-closed');
                }
                if (mapOptions) {
                    mapOptions.style.top = '';
                }
                if (mapDrawPanel) {
                    mapDrawPanel.style.top = '';
                }
                if (contactContainer) {
                    contactContainer.style.top = '';
                }

                if (calltakerPanel) {
                    calltakerPanel.style.top = '';
                    let ctBodyHeight = 90;
                    const domCrossRefReference = document.querySelector('.ct-cross-ref');
                    if (!!domCrossRefReference) {
                        let crossRefHeight = domCrossRefReference?.clientHeight;
                        if (crossRefHeight > 40) ctBodyHeight += 270;
                        else {
                            ctBodyHeight += 40;
                        }
                    }
                    const heightStyled = `calc(${
                        document.querySelector('calltaker-event-panel')?.clientHeight
                    }px - ${ctBodyHeight}px)`;
                    const ctNavTabsDOM = document.querySelector('.ct-navTabs');
                    const eventPanelNav = document.querySelector(
                        '.ct-navTabs .event-panel-body .event-panel-nav'
                    );
                    const eventPanelContentDOM = document.querySelector(
                        '.ct-navTabs .event-panel-body .event-panel-content'
                    );
                    eventPanelContentDOM['style'].height = heightStyled;
                    ctNavTabsDOM['style'].height = heightStyled;
                    eventPanelNav['style'].height = heightStyled;
                }
                if (calltakerAsEventPanel) {
                    const heightStyled = `calc(${
                        document.querySelector('.calltaker-panel-visible')?.clientHeight
                    }px - ${40}px)`;
                    const ctNavTabsDOM = document.querySelector(
                        '.calltaker-panel-visible .ctEP-navTabs'
                    );
                    const eventPanelContentDOM = document.querySelector(
                        '.calltaker-panel-visible .ctEP-navTabs .event-panel-body .event-panel-content'
                    );
                    eventPanelContentDOM['style'].height = heightStyled;
                    ctNavTabsDOM['style'].height = heightStyled;
                    const calltakerAsEventExpandedPanel: NodeListOf<HTMLElement> =
                        document.querySelectorAll(
                            '#Calltaker-As-EventPanel .event-panel-wrapper.expanded'
                        );
                    if (
                        !!calltakerAsEventExpandedPanel &&
                        calltakerAsEventExpandedPanel?.length > 0
                    ) {
                        _.forEach(calltakerAsEventExpandedPanel, ele => {
                            ele.style.top = '';
                            ele.style.height = '';
                        });
                    }
                }
                if (dockedpanel) {
                    dockedpanel.style.top = '';
                }
                if (callhandlingPanel) {
                    callhandlingPanel.style.marginTop = '';
                }
                if (!!calltakerCompactExpandedPanel && calltakerCompactExpandedPanel?.length > 0) {
                    _.forEach(calltakerCompactExpandedPanel, ele => {
                        ele.style.top = '';
                        ele.style.height = '';
                    });
                }
                _.forEach(this.dockedViews, d => {
                    if (d.key !== 'COMMAND_LINE_VIEW') {
                        const viewEl: HTMLElement = document.querySelector(
                            `[data-view-key="${d.key}"]`
                        );
                        viewEl.classList.remove('pushed');
                        if (this.activeDockedViews.includes(d)) {
                            viewEl.style.transform = `translate(${this.getTranslateX(viewEl)},0)`;
                        }
                    }
                });
            }
            _.remove(this.activeDockedViews, d => d.key === view.key);
            this.isAnimatingDock = false;

            if (el) {
                if (
                    document.querySelector('.gear-settings-btn') &&
                    document.querySelector('.gear-settings-btn').classList.contains('active')
                ) {
                    document.querySelector('.custom-feed-live-edit').classList.add('is-close');
                }
                this.animateDockedViewOut(el, mapOptions, dockDirection, width);
            }
        }

        if (view.key === 'SOP_PANEL') {
            sopPanelToggled.next(!!willShow);
        }
    };

    private getTranslateX = (el: HTMLElement): string => {
        let x = '0px';
        if (el) {
            const styles = window.getComputedStyle(el);
            if (styles) {
                var matrix = new WebKitCSSMatrix(styles.transform);
                if (matrix) {
                    const xVal = matrix.m41;
                    if (xVal !== 0 && !isNaN(xVal)) {
                        x = `${xVal}px`;
                    }
                }
            }
        }
        return x;
    };

    private animateDockedViewIn = (
        el: HTMLElement,
        mapOptions: HTMLElement,
        fromDirection: DockDirection,
        width: string
    ) => {
        let x = '0px',
            y = '0px';
        let initialTransforms = [];
        const dataViewKey = el.getAttribute('data-view-key');
        const pickWidget = el?.children[0]?.children[0] as HTMLElement;
        const undockedCommandLine = document.querySelectorAll(
            `:not(.docked-view) > command-line[view-key="'COMMAND_LINE_VIEW'"]`
        );
        const bottomDockedCommandLine = document.querySelector(
            ".docked-views-bottom > [data-view-key='COMMAND_LINE_VIEW']"
        );
        //determines if x should be moved if panel is showing, pushes an initial transform for map options
        const shiftX = () => {
            if (
                dataViewKey !== 'COMMAND_LINE_VIEW' &&
                dataViewKey !== 'CUSTOM_FEED_VIEW' &&
                dataViewKey !== 'CUSTOM_VIEWS'
            ) {
                x = '0px';
                if (mapOptions) {
                    initialTransforms.push(
                        () => (mapOptions.style.transform = 'translateX(494px)')
                    );
                }
                if (this.eventPanelVisible || this.unitPanelVisible) {
                    x = '500px';
                    if (mapOptions) {
                        initialTransforms.push(
                            () => (mapOptions.style.transform = 'translateX(990px)')
                        );
                    }
                }
            }
        };
        //determines if y should be moved if commandline is showing
        const shiftY = () => {
            if (dataViewKey !== 'COMMAND_LINE_VIEW') {
                y = this.commandLineVisible && !bottomDockedCommandLine ? '45px' : '0px';
            } else {
                y = bottomDockedCommandLine ? '-45px' : '0px';
            }
        };
        el.style.display = 'block';

        switch (fromDirection) {
            case DockDirection.Top:
                //push transform to set initial position
                initialTransforms.push(() => (el.style.transform = `translate(${x}, -100%)`));
                shiftY();
                shiftX();
                break;
            case DockDirection.Right:
                if (el.dataset.viewKey !== 'Informer AdHoc Query' && pickWidget) {
                    pickWidget.style.transform = 'translateX(430px)';
                } else {
                    //push transform to set initial position
                    initialTransforms.push(
                        () => (el.style.transform = `translate(${width}, ${y})`)
                    );
                    shiftY();
                }
                break;
            case DockDirection.Bottom:
                //push transform to set initial position
                initialTransforms.push(() => (el.style.transform = `translate(${x}, 100%)`));
                shiftY();
                shiftX();
                // shrink the size of the screen by the size of the size of the docked command line if there is an undocked command line
                if (undockedCommandLine && undockedCommandLine.length > 0) {
                    const singleScreenDiv = document.getElementsByClassName('single-screen-main')[0]
                        .children[0] as HTMLElement;
                    singleScreenDiv.style.height = `calc(100% - ${el.style.height})`;
                }
                break;
            case DockDirection.Left:
                //push transform to set initial position
                initialTransforms.push(() => (el.style.transform = `translate(-${width}, ${y})`));
                shiftX();
                shiftY();
                if (el.dataset.viewKey !== 'COMMAND_LINE_VIEW') {
                    if (this.eventPanelVisible || this.unitPanelVisible) {
                        if (mapOptions) {
                            mapOptions.style.transform = 'translateX(930px)';
                            if (
                                el.dataset.viewKey !== 'Informer AdHoc Query' &&
                                el.dataset.viewKey !== 'Smart Advisor' &&
                                pickWidget
                            ) {
                                pickWidget.style.transform = 'translateX(930px)';
                            }
                        }
                    } else {
                        if (mapOptions) {
                            mapOptions.style.transform = 'translateX(430px)';
                        }
                        if (
                            el.dataset.viewKey !== 'Informer AdHoc Query' &&
                            el.dataset.viewKey !== 'Smart Advisor' &&
                            pickWidget
                        ) {
                            pickWidget.style.transform = 'translateX(430px)';
                        }
                    }
                }
                break;
            default:
                break;
        }
        //run initial transforms
        initialTransforms.forEach(t => t());
        //run final transform
        this.$timeout(() => {
            if (dataViewKey === 'COMMAND_LINE_VIEW') {
                el.style.transform = `translateY(${y})`;
            } else if (
                el.dataset.viewKey === 'Informer AdHoc Query' ||
                el.dataset.viewKey === 'Smart Advisor'
            ) {
                el.style.transform = `translate(${x}, ${y})`;
            }
        }, 0);
    };

    private resetMapOptionsPosition = (dataViewKey: string, mapOptions: HTMLElement) => {
        //move map options back to original position
        if (
            dataViewKey !== 'COMMAND_LINE_VIEW' &&
            dataViewKey !== 'CUSTOM_FEED_VIEW' &&
            dataViewKey !== 'CUSTOM_VIEWS'
        ) {
            if (!this.eventPanelVisible && !this.unitPanelVisible) {
                const x = this.getTranslateX(mapOptions);
                if (x !== '0px') {
                    mapOptions.style.transform = 'translateX(0px)';
                }
            } else {
                mapOptions.style.transform = 'translateX(500px)';
            }
        }
    };

    private animateDockedViewOut = (
        el: HTMLElement,
        mapOptions: HTMLElement,
        toDirection: DockDirection,
        width: string
    ) => {
        const dataViewKey = el.getAttribute('data-view-key');
        const pickWidget = el?.children[0]?.children[0] as HTMLElement;
        switch (toDirection) {
            case DockDirection.Top:
                el.style.transform = 'translateY(-100%)';
                this.resetMapOptionsPosition(dataViewKey, mapOptions);
                break;
            case DockDirection.Right:
                if (
                    el.dataset.viewKey !== 'Informer AdHoc Query' &&
                    el.dataset.viewKey !== 'Smart Advisor' &&
                    pickWidget
                ) {
                    pickWidget.style.transform = 'translateX(430px)';
                } else {
                    el.style.transform = `translate(100vh, ${
                        this.commandLineVisible ? '45px' : '0px'
                    })`;
                    this.$timeout(() => {
                        el.style.display = 'none';
                    }, 300);
                }
                break;
            case DockDirection.Bottom:
                el.style.transform = 'translateY(100%)';
                const singleScreenDiv = document.getElementsByClassName('single-screen-main')[0]
                    .children[0] as HTMLElement;
                singleScreenDiv.style.height = '100%';
                this.resetMapOptionsPosition(dataViewKey, mapOptions);
                break;
            case DockDirection.Left:
                if (this.eventPanelVisible || this.unitPanelVisible) {
                    if (
                        el.dataset.viewKey === 'Informer AdHoc Query' ||
                        el.dataset.viewKey === 'Smart Advisor'
                    ) {
                        el.style.transform = `translateX(-${parseInt(width) + 500 + 'px'})`;
                    } else {
                        pickWidget.style.transform = 'translateX(-930px)';
                    }
                } else {
                    if (
                        el.dataset.viewKey === 'Informer AdHoc Query' ||
                        el.dataset.viewKey === 'Smart Advisor'
                    ) {
                        el.style.transform = `translateX(-${width})`;
                    } else {
                        pickWidget.style.transform = 'translateX(-430px)';
                    }
                }
                this.resetMapOptionsPosition(dataViewKey, mapOptions);
                break;
            default:
                break;
        }
    };

    //hide docked views in specified direction except command line and ignoreView if supplied
    public hideDocksInDirection = (
        dir: DockDirection,
        hideType = DockHideType.All,
        ignoredViewKey?: string
    ) => {
        //directions to hide
        const directionsToRemove = this.getDockDirectionsForHideType(dir, hideType);
        //map of directions that should hide each dock
        const dockDirections = new Map<LayoutView.V2_0_0.LayoutView, DockDirection[]>();
        _.forEach(this.activeDockedViews, d => {
            if (d.key !== ignoredViewKey) {
                dockDirections.set(
                    d,
                    this.getDockDirectionsForHideType(
                        (d.settings.find(s => s.property === 'docked') as IViewSetting)
                            ?.defaultValueParsed?.direction,
                        DOCK_HIDE_DIRECTIONS[d.key]
                    )
                );
            }
        });

        //hide the docks based on intersection of directions to hide and directions that hide each dock
        const docksToRemove: LayoutView.V2_0_0.LayoutView[] = [];
        _.forEach(this.activeDockedViews, d => {
            if (d.key !== ignoredViewKey) {
                const directionsForView = dockDirections.get(d);
                if (
                    _.some(directionsToRemove, direction => directionsForView.includes(direction))
                ) {
                    docksToRemove.push(d);
                }
            }
        });
        //uncomment following if want to "slide out widget panel" when 'contact directory/ notification panel/ ad-hoc-timer' panel showsUp.
        //_.forEach(docksToRemove, d => this.toggleDockedView(d));

        //hide the contacts directory menu
        const contactsContainer = document.getElementById('contact-directory-container');
        contactsContainer.classList.contains('contact-directory-show') ? true : false;
        if (
            ignoredViewKey !== 'CONTACT_DIRECTORY_MENU' &&
            contactsContainer &&
            _.some(directionsToRemove, direction =>
                this.getDockDirectionsForHideType(
                    IS_RTL ? DockDirection.Left : DockDirection.Right,
                    DOCK_HIDE_DIRECTIONS['CONTACT_DIRECTORY_MENU']
                ).includes(direction)
            )
        ) {
            this.toggleContactDirectoryPanel(false);
        }

        //hide the event panel
        if (
            ignoredViewKey !== 'EVENT_PANEL' &&
            this.eventPanelVisible &&
            _.some(directionsToRemove, direction =>
                this.getDockDirectionsForHideType(
                    IS_RTL ? DockDirection.Right : DockDirection.Left,
                    DOCK_HIDE_DIRECTIONS['EVENT_PANEL']
                ).includes(direction)
            )
        ) {
            this.eventPanelVisible = false;
        }

        //hide the unit panel
        if (
            ignoredViewKey !== 'UNIT_PANEL' &&
            this.unitPanelVisible &&
            _.some(directionsToRemove, direction =>
                this.getDockDirectionsForHideType(
                    IS_RTL ? DockDirection.Right : DockDirection.Left,
                    DOCK_HIDE_DIRECTIONS['UNIT_PANEL']
                ).includes(direction)
            )
        ) {
            this.unitPanelVisible = false;
        }

        //hide the notifications panel
        if (
            ignoredViewKey !== 'NOTIFICATIONS_PANEL' &&
            this.notificationsPanelVisible &&
            _.some(directionsToRemove, direction =>
                this.getDockDirectionsForHideType(
                    IS_RTL ? DockDirection.Left : DockDirection.Right,
                    DOCK_HIDE_DIRECTIONS['NOTIFICATIONS_PANEL']
                ).includes(direction)
            )
        ) {
            this.notificationsPanelVisible = false;
            this.$scope.$root.$broadcast(
                'notification-menu-' + (this.notificationsPanelVisible ? 'on' : 'off')
            );
        }

        //hide the ad-hoc timers panel
        if (
            ignoredViewKey !== 'AD_HOC_TIMERS_PANEL' &&
            this.adHocTimersPanelVisible &&
            _.some(directionsToRemove, direction =>
                this.getDockDirectionsForHideType(
                    IS_RTL ? DockDirection.Left : DockDirection.Right,
                    DOCK_HIDE_DIRECTIONS['AD_HOC_TIMERS_PANEL']
                ).includes(direction)
            )
        ) {
            this.adHocTimersPanelVisible = false;
            this.$scope.$root.$broadcast(
                'ad-hoc-timers-menu-' + (this.adHocTimersPanelVisible ? 'on' : 'off')
            );
        }
    };

    private getDockDirectionsForHideType = (
        dir: DockDirection,
        hideType = DockHideType.All
    ): DockDirection[] => {
        const directionsToRemove: DockDirection[] = [];
        switch (hideType) {
            case DockHideType.None:
                break;
            case DockHideType.Side:
                if (
                    dir === DockDirection.Right ||
                    (IS_RTL && dir === DockDirection.Top) ||
                    dir === DockDirection.Bottom
                ) {
                    directionsToRemove.push(DockDirection.Right);
                    if (IS_RTL) {
                        directionsToRemove.push(DockDirection.Top);
                        directionsToRemove.push(DockDirection.Bottom);
                    }
                } else {
                    directionsToRemove.push(DockDirection.Left);
                    if (!IS_RTL) {
                        directionsToRemove.push(DockDirection.Top);
                        directionsToRemove.push(DockDirection.Bottom);
                    }
                }
                break;
            case DockHideType.One:
                directionsToRemove.push(dir);
                break;
            default:
                //includes DockHideType.All
                directionsToRemove.push(DockDirection.Right);
                directionsToRemove.push(DockDirection.Left);
                directionsToRemove.push(DockDirection.Top);
                directionsToRemove.push(DockDirection.Bottom);
                break;
        }
        return directionsToRemove;
    };

    /** turn docks off when a panel opens */
    private handlePanelStateChange = ({
        showingEventPanel,
        showingUnitPanel,
        dockPanelsToOppositeSide
    }: IPanelManagerState) => {
        const mapOptions: HTMLElement = document.querySelector('.map-options-wrapper');
        const shiftMapOptions: boolean = mapOptions?.getBoundingClientRect().x <= 30;
        const dir = (this.activeDockedViews[0]?.settings[0] as IViewSetting)?.defaultValueParsed
            ?.direction;
        const customWidgetPanel = document.getElementsByClassName(`docked-views-${dir}`)[0]
            ?.children[0]?.children[0]?.children[0] as HTMLElement;
        if (this.eventPanelVisible !== showingEventPanel) {
            this.eventPanelVisible = showingEventPanel;

            if (this.eventPanelVisible && this.hasEventPanel) {
                if (dir === 'left' && this.widgetPanelOpen) {
                    customWidgetPanel.style.transform = 'translateX(930px)';
                    mapOptions.style.transform = 'translateX(930px)';
                } else if (
                    (dockPanelsToOppositeSide == false || IS_RTL) &&
                    (shiftMapOptions || this.isShowingSideMenu)
                ) {
                    mapOptions.style.transform = 'translateX(494px)';
                }
            }
            if (!this.eventPanelVisible) {
                if (dir === 'left' && this.widgetPanelOpen) {
                    customWidgetPanel.style.transform = 'translateX(430px)';
                    mapOptions.style.transform = 'translateX(435px)';
                } else mapOptions.style.transform = 'translateX(0px)';
            }
        }

        if (this.unitPanelVisible !== showingUnitPanel) {
            this.unitPanelVisible = showingUnitPanel;

            if (this.unitPanelVisible) {
                if (dir === 'left' && this.widgetPanelOpen) {
                    customWidgetPanel.style.transform = 'translateX(930px)';
                    mapOptions.style.transform = 'translateX(930px)';
                } else if (
                    (dockPanelsToOppositeSide == false || IS_RTL) &&
                    (shiftMapOptions || this.isShowingSideMenu)
                ) {
                    mapOptions.style.transform = 'translateX(494px)';
                }
            }
            if (!this.unitPanelVisible) {
                if (dir === 'left' && this.widgetPanelOpen) {
                    customWidgetPanel.style.transform = 'translateX(430px)';
                    mapOptions.style.transform = 'translateX(435px)';
                } else mapOptions.style.transform = 'translateX(0px)';
            }
        }
    };

    private buildDockedViewTag = (view: LayoutView.V2_0_0.LayoutView) =>
        new Promise<string>((resolve, reject) => {
            let h = '100%';
            let w = '100%';
            const fixedHeightSetting: IViewSetting = view.settings.find(
                s => s.property === 'fixedHeight'
            );
            if (fixedHeightSetting && fixedHeightSetting.defaultValueParsed) {
                h = fixedHeightSetting.defaultValueParsed;
            }
            const fixedWidthSetting: IViewSetting = view.settings.find(
                s => s.property === 'fixedWidth'
            );
            if (fixedWidthSetting && fixedWidthSetting.defaultValueParsed) {
                w = fixedWidthSetting.defaultValueParsed;
            }
            this.buildViewTag(view, true).then(viewHtml => {
                resolve(
                    `<div data-view-key="${view.key}" class="docked-view" style="height: ${h}; width: ${w};">${viewHtml}</div>`
                );
            });
        });

    private buildViewTag = (view: LayoutView.V2_0_0.LayoutView, docked?: boolean) =>
        new Promise<string[]>(async (resolve, reject) => {
            const replacementComponent =
                this.featureFlaggedViews[view.key] || this.featureFlaggedViews[view.component];
            if (replacementComponent) {
                view.component = replacementComponent;
                view.nonAngular = true;
            }
            const tag = _.kebabCase(view.component);
            const savedStateGuid = view.savedStateGuid;
            let argString = '';
            let classString = '';
            const toggleDockCallbackString = !docked
                ? ''
                : 'dismiss-docked-view="ssc.dismissDockedView"';

            if (view.type === 2) {
                this.DashboardService.Init();
                classString += ' is-dashboard-view';
            }

            if (view.isNotReplacementView) {
                const template = `${GLOBAL_BASE_URL}OnCallPresentation/${view.component}/index.html`;
                $.get(template, (data: string) => {
                    resolve([data]);
                });
            } else if (view.nonAngular && view.component && !view.react) {
                const viewDir = view.isAddonView
                    ? 'AddonViews'
                    : this.featureFlaggedViews[view.key] ||
                      viewFeatureFlagMapping.some(v => v.replacementView === view.component) ||
                      onCallPresentationViews.some(v => v.replacementView === view.component)
                    ? 'OnCallPresentation'
                    : 'CustomViews';
                const template = `${GLOBAL_BASE_URL}${viewDir}/${view.component}/index.html`;
                $.get(template, (data: string) => {
                    resolve([data]);
                });
            } else if (view.component && view.react) {
                const args: IViewSetting[] = _.filter(view.settings, s => s.isArgument);
                const props: any = {};
                args.forEach(arg => {
                    props[arg.property] = arg.defaultValueParsed;
                });

                const dockedSetting = args.find(arg => arg.property === 'docked');
                if (
                    dockedSetting &&
                    dockedSetting.defaultValueParsed &&
                    (dockedSetting.defaultValueParsed.docked ||
                        dockedSetting.valueType === 'boolean')
                ) {
                    props.dismissView = this.dismissDockedView;
                    props.isDocked = true;
                }

                const element = React.createElement(COMPONENTS[view.component], props, null);
                this.reactElements.push({
                    element,
                    guid: view.savedStateGuid
                });
                resolve([
                    `<div class="react-placeholder-parent cd-tabbable-view cd-custom-view"><div class="react-placeholder" data-guid="${view.savedStateGuid}"></div></div>`
                ]);
            } else if (view.component) {
                const args: IViewSetting[] = _.filter(view.settings, s => s.isArgument);
                if (!_.isEmpty(args)) {
                    argString += _.map(args, arg => {
                        if (arg.property && !_.isNil(arg.defaultValueParsed)) {
                            let value = _.cloneDeep(arg.defaultValueParsed);
                            if (
                                arg.valueType === 'string' ||
                                (arg.valueType === 'hardcoded' && arg.valueType.indexOf("'") !== 0)
                            ) {
                                value = `'${stripOuterSingleQuotes(arg.defaultValueParsed)}'`;
                            } else if (arg.valueType === 'object') {
                                if (typeof value === 'string') {
                                    value = arg.valueType.replace(/\'/g, "'").replace(/\"/g, "'");
                                } else {
                                    value = toInjectableJson(arg.defaultValueParsed);
                                }
                            } else if (arg.valueType === 'array') {
                                this.arrayArgs.push(arg.defaultValueParsed);
                                value = `ssc.arrayArgs[${this.arrayArgs.length - 1}]`;
                            }
                            return ` ${_.kebabCase(arg.property)}="${value}"`;
                        }

                        return '';
                    }).join(' ');
                }
                resolve([
                    `<${tag} class="${classString}" ${argString} saved-state-guid="'${savedStateGuid}'" ${toggleDockCallbackString} view-key="'${
                        view.key
                    }'" ${
                        docked
                            ? 'set-dock-badge-number="ssc.setDockedBadgeNumber" set-dock-icon-style="ssc.setDockIconStyle"'
                            : ''
                    }></${tag}>`
                ]);
            }
        });

    private setDockedBadgeNumber = (key: string, num: number) => {
        this.dockBadgeNumbers[key] = num;
    };

    private setDockIconStyle = (key: string, styles: any) => {
        this.dockIconStyles[key] = styles;
    };

    private setOtherScreens = () => {
        this.workspaceWindowsToOpen = [];
        for (let i = 1; i < this.activeWorkspace.screens.length; i++) {
            const sc = this.activeWorkspace.screens[i];
            const layoutToOpen = this.layouts.find(
                l => l && this.stringsEqual(l.id, sc.layouts[0])
            );
            if (layoutToOpen) {
                let tabToOpen: string;
                if (
                    this.settings &&
                    (this.stringsEqual(this.settings.workspaceId, this.activeWorkspace.id) ||
                        this.stringsEqual(this.settings.workspaceId, this.activeWorkspace.name))
                ) {
                    const newScreenSettings = this.settings.screens[i];
                    if (this.stringsEqual(newScreenSettings.layoutId, layoutToOpen.id)) {
                        tabToOpen = this.getString(newScreenSettings.tabId);
                    } else {
                        tabToOpen =
                            layoutToOpen.tabs.length > i
                                ? layoutToOpen.tabs[i]
                                : _.last(layoutToOpen.tabs);
                    }
                } else {
                    tabToOpen =
                        layoutToOpen.tabs.length > i
                            ? layoutToOpen.tabs[i]
                            : _.last(layoutToOpen.tabs);
                }
                this.workspaceWindowsToOpen.push(
                    `${GLOBAL_BASE_URL}?workspace=${this.activeWorkspace.id}&wsscreen=${i}&layout=${layoutToOpen.id}&tab=${tabToOpen}`
                );
            }
        }
        if (this.offerToOpenOtherTabs) {
            this.willOpenNewTabsPrompt = getStrings(
                'WORKSPACE_WILL_OPEN_NEW_TABS_PROMPT',
                (this.activeWorkspace.screens.length - 1).toString()
            );
            this.showWillOpenNewTabsModal = true;
        } else if (this.openOtherTabs) {
            this.openOtherWorkspaceWindows();
        }
    };

    private collectUrlParams = () => {
        const params = getUrlParams();
        const lowerCaseParams = {};
        Object.keys(params).forEach(key => {
            lowerCaseParams[key.toLowerCase()] = params[key];
        });
        this.urlParams = lowerCaseParams;
    };

    // Handle things like ampersands in names of Tabs/Layouts, etc., since window.encodeURI() does not handle them.
    private decodeSpecialChars = (str: string) => {
        return str
            .replace('__and__', '&')
            .replace('__que__', '?')
            .replace('__slash__', '/')
            .replace('__hash__', '#')
            .replace('__eq__', '=');
    };

    private getTabLabelById = (id: string) => {
        const tab = this.tabs.find(t => t.id === id);
        return tab ? getIfNotLocalized(tab.label || tab.name) : '';
    };

    private aboutBox = () => {
        this.isOpenAbout = !this.isOpenAbout;
        processCommand('ABOUTBOX');
    };

    public toggleScannerModal = () => {
        this.showScannerModal = !this.showScannerModal;
    };

    // Check to see if we're missing default workspaces, if we are missing it, set it up
    private checkDefaultWorkspaces = () => {
        // We need to check our default values
        let updatedWorkspaces: any = [];
        _.forEach(LayoutDefaults.workspaces, workspace => {
            const found = _.filter(this.allWorkspaces, w => w.id === workspace.id);
            if (_.isEmpty(found)) {
                // we didn't find this workspace so we need to add it
                updatedWorkspaces.push(workspace);
                console.log('Default workspace ' + workspace.id + ' not found, adding workspace');
            } else {
                // We found an existing workspace, lets check to see if we have the latest version of this workspace
                const currentWorkspace = found[0];
                if (currentWorkspace.version < workspace.version) {
                    console.log('Updating this workspace to a newer version');
                    updatedWorkspaces.push(workspace);
                }
            }
        });
        if (updatedWorkspaces && updatedWorkspaces.length > 0) {
            saveWorkspaces(updatedWorkspaces);
        }
    };

    // Check to see if we're missing default layouts, if we are missing it, set it up
    private checkDefaultLayouts = () => {
        // We need to check our default values
        let updatedLayouts: any = [];
        _.forEach(LayoutDefaults.layouts, layout => {
            const found = _.filter(this.layouts, w => w.id === layout.id);
            if (_.isEmpty(found)) {
                // we didn't find this workspace so we need to add it
                updatedLayouts.push(layout);
                console.log('Default layout ' + layout.id + ' not found, adding layout');
            } else {
                // We found an existing layout, lets check to see if we have the latest version of this layout as a default
                const currentLayout = found[0];

                // if the version is out of date or if this layout has somehow been modified so it doesn't match, then resave it
                if (currentLayout.version < layout.version || !_.isEqual(currentLayout, layout)) {
                    console.log('Updating this layout to a newer version');
                    updatedLayouts.push(layout);
                }
            }
        });
        if (updatedLayouts && updatedLayouts.length > 0) {
            saveLayouts(updatedLayouts);
        }
    };

    // Check to see if we're missing default tabs, if we are missing it, set it up
    private checkDefaultTabs = () => {
        // We need to check our default values
        let updatedTabs: any = [];
        _.forEach(LayoutDefaults.tabs, tab => {
            const foundIndex = _.findIndex(this.tabs, w => w.id === tab.id);
            if (foundIndex < 0) {
                // we didn't find this tab so we need to add it
                updatedTabs.push(tab);
                this.tabs.push(tab);
                console.log('Default layout ' + tab.id + ' not found, adding layout');
            } else {
                // We found an existing tab, lets check to see if we have the latest version of this tab as a default
                const currentTab = this.tabs[foundIndex];
                if (currentTab.version < tab.version || !_.isEqual(currentTab, tab)) {
                    console.log('Updating this tab to a newer version');
                    updatedTabs.push(tab);
                    this.tabs[foundIndex] = tab;
                }
            }
        });
        if (updatedTabs && updatedTabs.length > 0) {
            saveTabs(updatedTabs);
        }
    };

    public openPopup = (customPopup: CustomPopupWindow) => {
        this.$scope.$applyAsync(() => {
            this.showPopupWindow = true;
            this.customPopupWindow = customPopup;
        });
    };

    public dismissPopupWindow = () => {
        this.$scope.$applyAsync(() => {
            this.showPopupWindow = false;
            this.customPopupWindow = null;
        });
    };

    public isDockedViewActive = (v: LayoutView.V2_0_0.LayoutView) =>
        this.activeDockedViews.some(av => av.key === v.key);

    public isActiveTab = (identifier: string) => {
        if (!this.activeTab) {
            return false;
        }

        const foundTab = _.find(this.tabs, tab => tab.label === this.getTabLabelById(identifier));

        return (
            this.stringsEqual(this.activeTab.label, identifier) ||
            this.stringsEqual(this.activeTab.name, identifier) ||
            this.stringsEqual(this.activeTab.id, identifier) ||
            this.stringsEqual(this.activeTab.label, foundTab?.label) ||
            this.stringsEqual(this.activeTab.label, foundTab?.name) ||
            this.stringsEqual(this.activeTab.label, foundTab?.id)
        );
    };

    private mobileUnitUpdated = (args: ICacheChangeArgs<IUnitCacheItem>) => {
        console.log('SingleScreen.mobileUnitUpdated: In mobileUnitUpdated!!!!');
        // To disable tab by unit update by OMU
        this.setDisabledMyEventTab();
    };

    private addToDisableTabName = (tabName: string) => {
        if (this.disabledTabNames.indexOf(tabName) === -1) {
            this.disabledTabNames.push(tabName);
        }
    };

    private removeFromDisableTabName = (tabName: string) => {
        const i = this.disabledTabNames.indexOf(tabName);
        if (i !== -1) {
            this.disabledTabNames.splice(-1, 1);
        }
    };

    public setDisabledMyEventTab = () => {
        if (!this.unitId) {
            return;
        }

        this.UnitService.get(this.unitId)
            .then(u => {
                if (u && !u.AssignedEventId) {
                    console.log(
                        `SingleScreen.setDisabledMyEventTab, ADD this.myEventTabName, ${this.myEventTabName}, INTO this.disabledTabNames`
                    );
                    this.addToDisableTabName(this.myEventTabName);

                    if (
                        JSON.stringify(getLocalStorageItem('active-tab'))?.includes(
                            this.selectedEventViewName
                        )
                    ) {
                        this.navigateToTabByName(this.myPatrolTabName);
                    }
                } else {
                    console.log(
                        `SingleScreen.setDisabledMyEventTab, REMOVE this.myEventTabName, ${this.myEventTabName}, FROM this.disabledTabNames`
                    );
                    this.removeFromDisableTabName(this.myEventTabName);
                }
            })
            .catch(e => console.error('Error setting disabled my event tab. ', e));
    };

    public isDisabledTab = (identifier: string) => {
        const tab = this.tabs.find(t => t.id === identifier);
        if (
            tab &&
            (this.disabledTabNames.indexOf(tab.id) !== -1 ||
                this.disabledTabNames.indexOf(tab.name) !== -1)
        ) {
            return true;
        }
        return false;
    };

    private findActiveTabWithViewName = (viewName: string): LayoutTab.V2_0_0.LayoutTab => {
        let theActiveTab;

        for (let i = 0; i < this.activeTabs.length; i++) {
            const tab = this.activeTabs[i];
            const stringifiedTab = JSON.stringify(tab);
            if (stringifiedTab.includes(viewName)) {
                theActiveTab = tab;
                break;
            }
        }

        return theActiveTab;
    };

    private findActiveTabNameWithViewName = (viewName: string): string => {
        let tabName;

        for (let i = 0; i < this.activeTabs.length; i++) {
            const tab = this.activeTabs[i];
            const stringifiedTab = JSON.stringify(tab);
            if (stringifiedTab.includes(viewName)) {
                tabName = tab.name;
                break;
            }
        }

        return tabName;
    };

    private findTabWithViewName = (viewName: string): string => {
        let tabName;

        getSharedTabs().then(tabs => {
            for (let i = 0; i < tabs.length; i++) {
                const tab = tabs[i];
                const stringifiedTab = JSON.stringify(tab);
                if (stringifiedTab.includes(viewName)) {
                    tabName = tab.name;
                    break;
                }
            }
        });

        return tabName;
    };

    private setMyEventTabNameIfUndefined(functionName: string) {
        if (this.activeLayout.tabs.indexOf(this.myEventTabName) === -1) {
            this.myEventTabName = this.findTabWithViewName(this.selectedEventViewName);
            if (
                _.isNil(this.myEventTabName) &&
                !_.isNil(this.activeTabs) &&
                this.activeTabs.length > 0
            ) {
                this.myEventTabName = this.findActiveTabNameWithViewName(
                    this.selectedEventViewName
                );
                if (!_.isNil(this.myEventTabName)) {
                    this.setDisabledMyEventTab();
                }
            }
            console.log(
                `SingleScreen.${functionName}: set myEventTabName = ${this.myEventTabName}`
            );
        }
    }

    private featureFlaggedViews: { [key: string]: string } = {};

    private setFeatureFlaggedViews = () => {
        if (!viewFeatureFlagMapping.length) {
            return Promise.resolve();
        }

        return Promise.all(
            viewFeatureFlagMapping.map(({ existingView, featureFlag, replacementView }) => {
                featureFlag().then(isEnabled => {
                    if (isEnabled) {
                        this.featureFlaggedViews[existingView] = replacementView;
                    }
                });
            })
        );
    };

    public setSystemUpgraded = (upgraded: boolean) => {
        this.systemUpgraded = upgraded;
    };
}
