// @flow
import * as React from "react";
import moment from "moment";
import ArrowBoldDownIcon from "@skbkontur/react-icons/ArrowBoldDown";
import ArrowBoldUpIcon from "@skbkontur/react-icons/ArrowBoldUp";
import TrashIcon from "@skbkontur/react-icons/Trash";
import DropdownMenu from "retail-ui/components/DropdownMenu";
import MenuHeader from "retail-ui/components/MenuHeader";
import MenuSeparator from "retail-ui/components/MenuSeparator";
import MenuItem from "retail-ui/components/MenuItem";
import Button from "retail-ui/components/Button";
import type { Maintenance } from "../../Domain/Maintenance";
import type { Metric } from "../../Domain/Metric";
import roundValue from "../../helpers/roundValue";
import { Maintenances, getMaintenanceCaption } from "../../Domain/Maintenance";
import StatusIndicator from "../StatusIndicator/StatusIndicator";
import cn from "./MetricList.less";

export type SortingColum = "state" | "name" | "event" | "value";

type Props = {|
    status?: boolean,
    items: {
        [metric: string]: Metric,
    },
    sortingColumn: SortingColum,
    sortingDown?: boolean,
    noDataMerticCount?: number,
    onSort?: (sorting: SortingColum) => void,
    onChange: (metric: string, maintenance: Maintenance) => void,
    onRemove: (metric: string) => void,
    onNoDataRemove?: () => void,
|};

function checkMaintenance(maintenance: ?number): React.Node {
    const delta = (maintenance || 0) - moment.utc().unix();
    return <span>{delta <= 0 ? "Maintenance" : moment.duration(delta * 1000).humanize()}</span>;
}

export default function MetricList(props: Props): React.Node {
    const {
        status,
        items,
        onSort,
        onChange,
        onRemove,
        noDataMerticCount,
        onNoDataRemove,
        sortingColumn,
        sortingDown,
    } = props;

    const sortingIcon = sortingDown ? <ArrowBoldDownIcon /> : <ArrowBoldUpIcon />;

    return (
        <section className={cn("table")}>
            <header className={cn("row", "header")}>
                {status && <div className={cn("state")} />}
                <div className={cn("name")}>
                    <button
                        type="button"
                        className={cn("a11y-span", { sorting: onSort })}
                        onClick={onSort && (() => onSort("name"))}
                    >
                        Name
                        {sortingColumn === "name" && (
                            <span className={cn("icon")}>{sortingIcon}</span>
                        )}
                    </button>
                </div>
                <div className={cn("event")}>
                    <button
                        type="button"
                        className={cn("a11y-span", { sorting: onSort })}
                        onClick={onSort && (() => onSort("event"))}
                    >
                        Last event{" "}
                        {sortingColumn === "event" && (
                            <span className={cn("icon")}>{sortingIcon}</span>
                        )}
                    </button>
                </div>
                <div className={cn("value")}>
                    <button
                        type="button"
                        className={cn("a11y-span", { sorting: onSort })}
                        onClick={onSort && (() => onSort("value"))}
                    >
                        Value{" "}
                        {sortingColumn === "value" && (
                            <span className={cn("icon")}>{sortingIcon}</span>
                        )}
                    </button>
                </div>
                <div className={cn("maintenance")} />
                <div className={cn("delete")}>
                    {typeof noDataMerticCount === "number" &&
                        noDataMerticCount > 1 &&
                        onNoDataRemove && (
                            <Button
                                use="link"
                                icon={<TrashIcon />}
                                onClick={() => onNoDataRemove()}
                            >
                                Delete all NODATA
                            </Button>
                        )}
                </div>
            </header>
            <div className={cn("items")}>
                {Object.keys(items).map(metric => {
                    const {
                        value,
                        event_timestamp: eventTimestamp = 0,
                        state,
                        maintenance,
                        maintenance_who: maintenanceWho,
                    } = items[metric];
                    return (
                        <div key={metric} className={cn("row")}>
                            {status && (
                                <div className={cn("state")}>
                                    <StatusIndicator statuses={[state]} size={10} />
                                </div>
                            )}
                            <div className={cn("name")}>{metric}</div>
                            <div className={cn("event")}>
                                {moment.unix(eventTimestamp).format("MMMM D, HH:mm:ss")}
                            </div>
                            <div className={cn("value")}>{roundValue(value)}</div>
                            <div className={cn("maintenance")}>
                                <DropdownMenu
                                    caption={
                                        <Button use="link">{checkMaintenance(maintenance)}</Button>
                                    }
                                >
                                    {Object.keys(Maintenances).map(key => (
                                        <MenuItem key={key} onClick={() => onChange(metric, key)}>
                                            {getMaintenanceCaption(key)}
                                        </MenuItem>
                                    ))}
                                    {maintenanceWho.start_user && maintenanceWho.start_time && (
                                        <MenuSeparator />
                                    )}
                                    {maintenanceWho.start_user && maintenanceWho.start_time && (
                                        <MenuHeader>
                                            Maintenance was set
                                            <br />
                                            by {maintenanceWho.start_user}
                                            <br />
                                            at{" "}
                                            {moment
                                                .unix(maintenanceWho.start_time)
                                                .format("MMMM D, HH:mm:ss")}
                                        </MenuHeader>
                                    )}
                                </DropdownMenu>
                            </div>
                            <div className={cn("delete")}>
                                <Button
                                    use="link"
                                    icon={<TrashIcon />}
                                    onClick={() => onRemove(metric)}
                                >
                                    Delete
                                </Button>
                            </div>
                        </div>
                    );
                })}
            </div>
        </section>
    );
}
