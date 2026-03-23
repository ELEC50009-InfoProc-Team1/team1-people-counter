import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import { alpha } from "@mui/material/styles";
import type { PropsWithChildren, ReactNode } from "react";
import { Link } from "react-router";
import { grey } from "~/theme/theme";
import { PeopleCounter } from "../branding/PeopleCounter";
import { ModeSwitcher } from "../ModeSwitcher";
import { formLabelClasses } from "@mui/material/FormLabel";


const backgroundImage = "https://images.unsplash.com/photo-1771506364945-0b6566c6cd5f";


export const AuthPageStyle = ({ children }: PropsWithChildren): ReactNode => {
    return (
        <>
            <Stack
                justifyContent="flex-end"
                sx={theme => ({
                    width: {
                        xs: "100%",
                        md: "50vw"
                    },
                    position: "relative",
                    zIndex: 1,
                    backdropFilter: "blur(12px)",
                    backgroundColor: alpha(grey[200], 0.2),
                    ...theme.applyStyles("dark", {
                        backgroundColor: alpha(grey[800], 0.4)
                    })
                })}
            >
                <Stack
                    direction="column"
                    minHeight="100dvh"
                    width={1}
                    sx={{
                        px: 2
                    }}
                >
                    <Stack
                        direction="row"
                        component="header"
                        justifyContent="space-between"
                        alignItems="center"
                        sx={{
                            py: 3
                        }}
                    >
                        <Link
                            to="/"
                            style={{
                                textDecoration: "none",
                                color: "unset"
                            }}
                        >
                            <Box
                                sx={{
                                    ml: "-16px"
                                }}
                            >
                                <PeopleCounter />
                            </Box>
                        </Link>
                        <ModeSwitcher />
                    </Stack>
                    <Stack
                        component="main"
                        direction="column"
                        gap={2}
                        sx={{
                            my: "auto",
                            py: 2,
                            pb: 5,
                            width: 400,
                            maxWidth: "100%",
                            mx: "auto",
                            "& form": {
                                display: "flex",
                                flexDirection: "column",
                                gap: 2
                            },
                            [`& .${formLabelClasses.asterisk}`]: {
                                display: "none"
                            }
                        }}
                    >
                        {children}
                    </Stack>
                    <Stack
                        component="footer"
                        direction="row"
                        justifyContent="space-between"
                        alignItems="end"
                        sx={{
                            py: 2
                        }}
                    >
                        {/* footer things can go here */}
                    </Stack>
                </Stack>
            </Stack>

            <Box
                sx={{
                    height: "100%",
                    position: "fixed",
                    right: 0,
                    top: 0,
                    bottom: 0,
                    left: {
                        sx: 0,
                        md: "50vw"
                    },
                    backgroundColor: "Background",
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                    backgroundRepeat: "no-repeat",
                    backgroundImage: `url(${backgroundImage})`
                }}
            >

            </Box >
        </>
    );
};
