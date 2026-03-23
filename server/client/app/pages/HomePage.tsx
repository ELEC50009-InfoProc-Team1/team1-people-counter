import { Box, Paper, paperClasses, Stack, Table, TableBody, TableCell, TableHead, TableRow, Typography } from "@mui/material";
import { useEffect, useState, type ReactNode } from "react";
import { Link } from "react-router";
import { OccupancyPlot } from "~/components/information/OccupancyPlot";
import { StructureDiagram } from "~/components/information/StructureDiagram";
import { APIManager } from "~/managers/APIManager";

export const HomePage = (): ReactNode => {
    const [popular, setPopular] = useState<Awaited<ReturnType<typeof APIManager.Room.popular>>>();

    const loadPopular = async () => {
        let res = await APIManager.Room.popular();

        setPopular(res);
    };

    useEffect(() => {
        loadPopular();
    }, []);

    return (
        <Stack
            gap={3}
            sx={{
                px: {
                    xs: 2,
                    md: 6
                },
                [`& .${paperClasses.root}`]: {
                    p: 3
                }
            }}
        >
            <Paper
                component={Stack}
                variant="outlined"
            >
                <Typography
                    variant="h4"
                >
                    leaderboard
                </Typography>
                <Stack
                    direction={{
                        xs: "column",
                        md: "row"
                    }}
                    sx={{
                        width: "100%"
                    }}
                    justifyContent="space-between"
                    gap={2}
                >
                    <Stack
                        gap={1}
                        alignItems="center"
                        justifyContent="center"
                        width={{
                            xs: 1,
                            md: 0.5
                        }}
                        sx={{
                            py: 2
                        }}
                    >
                        <Typography
                            variant="h2"
                            component={Link}
                            to={`/room/${popular?.[0]?.id}`}
                        >
                            {popular?.[0]?.name}
                        </Typography>
                        <Typography
                            align="center"
                        >
                            is the most relatively popular room over the last week
                            with a score of {Math.round((popular?.[0]?.normalisedPopularity || 0) * 100) / 100}
                        </Typography>
                    </Stack>
                    <Stack
                        width={{
                            xs: 1,
                            md: 0.5
                        }}
                    >
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell
                                        width={2}
                                    >
                                        #
                                    </TableCell>
                                    <TableCell>name</TableCell>
                                    <TableCell align="right">score</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {
                                    popular?.map((x, i) => {
                                        if (i == 0) return null;
                                        return (
                                            <TableRow>
                                                <TableCell>{i + 1}</TableCell>
                                                <TableCell
                                                    //@ts-ignore
                                                    component={Link}
                                                    to={`/room/${x.id}`}
                                                >
                                                    {x.name}
                                                </TableCell>
                                                <TableCell align="right">{Math.round((x.normalisedPopularity || 0) * 100) / 100}</TableCell>
                                            </TableRow>
                                        );
                                    })
                                }
                            </TableBody>
                        </Table>
                    </Stack>
                </Stack>
            </Paper>

            {
                popular?.[0] ?
                    <Paper
                        component={Stack}
                        variant="outlined"
                    >
                        <Typography
                            variant="h4"
                        >
                            occupancy plot
                        </Typography>
                        <Box
                            sx={{
                                position: "relative",
                                minHeight: "400px"
                            }}
                        >
                            <OccupancyPlot
                                roomIDs={popular.map(x => x.id)}
                            />
                        </Box>
                    </Paper>
                    : null
            }

            <Paper
                component={Stack}
                variant="outlined"
            >
                <Typography
                    variant="h4"
                >
                    data structure
                </Typography>
                <StructureDiagram />
            </Paper>
        </Stack>
    );
};
