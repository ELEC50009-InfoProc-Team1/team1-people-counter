import type { Theme } from "@mui/material/styles";
import { Paper, paperClasses, Stack, Typography } from "@mui/material";
import { useEffect, useState, type ReactNode } from "react";
import { ModeSwitcher } from "~/components/ModeSwitcher";
import { APIManager, type RoomObject } from "~/managers/APIManager";

export const RoomDataPage = ({ room: roomIn }: { room: RoomObject; }): ReactNode => {
    const [room, setRoom] = useState<RoomObject>({
        name: "loading...",
        currentNoOfPeople: -1,
        id: roomIn.id,
        floorID: "",
        maxCapacity: -1
    });

    const refreshRoom = async () => {
        if (window.location.pathname != `/room/${roomIn.id}`) return;

        let room = await APIManager.Room.get(roomIn.id);
        if (!room) setRoom({
            name: "loading...",
            currentNoOfPeople: -1,
            id: roomIn.id,
            floorID: "",
            maxCapacity: -1
        });
        else setRoom(room);

        setTimeout(refreshRoom, 2000);
    };

    useEffect(() => {
        setRoom(roomIn);
        setTimeout(refreshRoom, 2000);
    }, []);

    return (
        <Stack
            direction="column"
            sx={{
                minHeight: "100vh",
                p: 3,
            }}
            gap={3}
            alignItems="center"
            justifyContent="center"
        >
            <Stack
                sx={{
                    maxWidth: "500px",
                    width: "100%"
                }}
                gap={3}
            >
                <Paper
                    variant="outlined"
                    sx={{
                        p: 3,
                        width: "100%"
                    }}
                >
                    <Stack>
                        <Typography
                            variant="h4"
                        >
                            room
                        </Typography>
                        <Typography
                            variant="h1"
                        >
                            {room.name}
                        </Typography>
                    </Stack>
                </Paper>
                <Stack
                    direction={{
                        md: "row",
                        xs: "column"
                    }}
                    sx={{
                        width: "100%",
                        [`& .${paperClasses.root}`]: {
                            width: "100%",
                            p: 3
                        }
                    }}
                    gap={3}
                >
                    <Paper
                        variant="outlined"
                        sx={theme => ({
                            backgroundColor: getColFromCapacity(room.currentNoOfPeople / room.maxCapacity, theme)
                        })}
                    >
                        <Stack>

                            <Typography
                                variant="h4"
                                align="center"
                                sx={{
                                    mb: 2
                                }}
                            >
                                occupancy
                            </Typography>
                        </Stack>
                        <Stack
                            direction="row"
                            justifyContent="space-between"
                        >
                            <Typography
                                variant="h2"
                                align="center"
                                width={1}
                            >
                                {room.currentNoOfPeople}
                            </Typography>
                            <Typography
                                variant="h2"
                                align="center"
                                width={1}
                            >/</Typography>
                            <Typography
                                variant="h2"
                                align="center"
                                width={1}
                            >
                                {room.maxCapacity}
                            </Typography>
                        </Stack>
                    </Paper>
                </Stack>
                <Stack
                    direction="row"
                    justifyContent="end"
                    width={1}
                >
                    <ModeSwitcher
                        sx={{
                            p: 3
                        }}
                    />
                </Stack>
            </Stack>
        </Stack>
    );
};


const getColFromCapacity = (capacity: number, theme: Theme) => {
    if (capacity <= 0.5) {
        return (theme.vars || theme).palette.success.main;
    } else if (capacity <= 0.75) {
        return (theme.vars || theme).palette.warning.main;
    } else {
        return (theme.vars || theme).palette.error.main;
    }
};
