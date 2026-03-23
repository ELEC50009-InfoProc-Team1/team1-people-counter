import { useEffect, useMemo, useState } from "react";
import { APIManager } from "~/managers/APIManager";
import { Chart, type AxisOptions } from "react-charts";
import { Typography } from "@mui/material";

type OccupancyRecord = {
    timestamp: Date,
    occupancy: number;
};

type Series = {
    label: string;
    data: OccupancyRecord[];
};

export const OccupancyPlot = ({ roomIDs }: { roomIDs: string[]; }) => {
    const [stats, setStats] = useState<Map<string, Awaited<ReturnType<typeof APIManager.Room.stats>>>>(new Map());
    const [names, setNames] = useState<Map<string, string>>(new Map());

    const loadStats = async () => {
        let tempMap = new Map(stats);
        let tempNames = new Map(names);
        for (const roomID of roomIDs) {
            let res = await APIManager.Room.stats(roomID);
            let room = (await APIManager.Room.get(roomID))?.name;
            tempNames.set(roomID, room || "unnamed room");
            tempMap.set(roomID, res);
        }

        setStats(tempMap);
        setNames(tempNames);
    };

    useEffect(() => {
        loadStats();
    }, []);

    const data: Series[] = roomIDs?.map(x => ({
        label: names.get(x) || "unknown room",
        data: stats.get(x) || []
    }));

    const primaryAxis = useMemo(
        (): AxisOptions<OccupancyRecord> => ({
            getValue: x => x.timestamp
        }),
        []
    );

    const secondaryAxes = useMemo(
        (): AxisOptions<OccupancyRecord>[] => [
            {
                getValue: x => x.occupancy
            }
        ],
        []
    );

    if (!data[0]?.data.length) return (
        <Typography>loading...</Typography>
    );

    return (
        <Chart
            options={{
                data,
                primaryAxis,
                secondaryAxes
            }}
        />
    );
};
