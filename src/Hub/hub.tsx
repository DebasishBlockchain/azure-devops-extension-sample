import "./Hub.scss";

import * as React from "react";
import * as DevOps from "azure-devops-extension-sdk";

import { Header, IHeaderCommandBarItem, Page, TitleSize } from "vss-ui/Page";
import { Tab, TabBar, TabSize } from "vss-ui/Tabs";

import { OverviewTab } from "./OverviewTab"; 
import { NavigationTab } from "./NavigationTab";
import { ExtensionDataTab } from "./ExtensionDataTab";
import { MessagesTab } from "./MessagesTab";
import { showRootComponent } from "../Common";

interface IHubContentState {
    selectedTabId: string;
    headerKicker?: string;
    useLargeTitle?: boolean;
    useCompactPivots?: boolean;
}

class HubContent extends React.Component<{}, IHubContentState> {

    constructor(props: {}) {
        super(props);

        this.state = {
            selectedTabId: "overview"
        };
    }

    public componentDidMount() {
        DevOps.init({
            applyTheme: true,
            loaded: true
        });
    }

    public render(): JSX.Element {

        const { selectedTabId, headerKicker, useCompactPivots, useLargeTitle } = this.state;

        return (
            <Page className="sample-hub flex-grow">

                <Header title="Sample Hub"
                    commandBarItems={this.getCommandBarItems()}
                    kicker={headerKicker}
                    titleSize={useLargeTitle ? TitleSize.Large : TitleSize.Medium} />

                <TabBar
                    onSelectedTabChanged={this.onSelectedTabChanged}
                    selectedTabId={selectedTabId}
                    tabSize={useCompactPivots ? TabSize.Compact : TabSize.Tall}>

                    <Tab name="Overview" id="overview" />
                    <Tab name="Navigation" id="navigation" />
                    <Tab name="Extension Data" id="extensionData" />
                    <Tab name="Messages" id="messages" />
                </TabBar>

                <div className="page-content">
                    { this.getPageContent() }
                </div>
            </Page>
        );
    }

    private onSelectedTabChanged = (newTabId: string) => {
        this.setState({
            selectedTabId: newTabId
        })
    }

    private getPageContent() {
        const { selectedTabId } = this.state;
        if (selectedTabId === "overview") {
            return <OverviewTab />;
        }
        else if (selectedTabId === "navigation") {
            return <NavigationTab />;
        }
        else if (selectedTabId === "extensionData") {
            return <ExtensionDataTab />;
        }
        else if (selectedTabId === "messages") {
            return <MessagesTab />;
        }
    }

    private getCommandBarItems(): IHeaderCommandBarItem[] {
        return [
            {
              key: "panel",
              name: "Panel",
              onClick: this.onPanelClick,
              iconProps: {
                iconName: 'Add'
              },
              isPrimary: true,
              tooltipProps: {
                content: "Open a panel with custom extension content"
              }
            },
            {
              key: "messageDialog",
              name: "Message",
              onClick: this.onMessagePromptClick,
              tooltipProps: {
                content: "Open a simple message dialog"
              }
            },
            {
              key: "customDialog",
              name: "Custom Dialog",
              onClick: this.onCustomPromptClick,
              tooltipProps: {
                content: "Open a dialog with custom extension content"
              }
            }
        ];
    }

    private onMessagePromptClick = (): void => {
        DevOps.getService<DevOps.IHostDialogService>(DevOps.CommonServiceIds.HostDialogService).then((dialogService) => {
            dialogService.openMessageDialog("Use large title?", {
                showCancel: true,
                title: "Message dialog",
                onClose: (result) => {
                    this.setState({ useLargeTitle: result });
                }
            });
        });
    }

    private onCustomPromptClick = (): void => {
        DevOps.getService<DevOps.IHostDialogService>(DevOps.CommonServiceIds.HostDialogService).then((dialogService) => {
            dialogService.openCustomDialog<boolean | undefined>(DevOps.getExtensionContext().id + ".panel-content", {
                title: "Custom dialog",
                configuration: {
                    message: "Use compact pivots?",
                    initialValue: this.state.useCompactPivots
                },
                onClose: (result) => {
                    if (result !== undefined) {
                        this.setState({ useCompactPivots: result });
                    }
                }
            });
        });
    }

    private onPanelClick = (): void => {
        DevOps.getService<DevOps.IHostPanelService>(DevOps.CommonServiceIds.HostPanelService).then((panelService) => {
            panelService.openPanel<boolean | undefined>(DevOps.getExtensionContext().id + ".panel-content", {
                title: "My Panel",
                description: "Description of my panel",
                configuration: {
                    message: "Show header kicker?",
                    initialValue: !!this.state.headerKicker
                },
                onClose: (result) => {
                    if (result !== undefined) {
                        this.setState({ headerKicker: result ? "This is a kicker" : undefined });
                    }
                }
            });
        });
    }
}

showRootComponent(<HubContent />);