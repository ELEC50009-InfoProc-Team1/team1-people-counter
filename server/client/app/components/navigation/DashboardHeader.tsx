import { ChevronRightRounded, DashboardRounded, MenuRounded } from "@mui/icons-material";
import { Box, Breadcrumbs, Button, GlobalStyles, Link as MUILink, Paper, Typography } from "@mui/material";
import { type ReactNode } from "react";
import useDashboardNavigation from "../../util/useDashboardNavigation";
import { Link } from "react-router";
import { toggleSidebar } from "./DashboardSidebar";

export const DashboardHeader = (): ReactNode => {
    // @ts-expect-error
    const { navigationContext, setNavigationContext } = useDashboardNavigation();

    return (
        <Box
            sx={{
                zIndex: 997
            }}
        >
            <Paper
                sx={theme => ({
                    display: {
                        xs: "flex",
                        md: "none"
                    },
                    alignItems: "center",
                    justifyContent: "space-between",
                    position: "fixed",
                    top: 0,
                    width: "100vw",
                    height: "var(--Header-height)",
                    zIndex: 998,
                    p: 2,
                    gap: 1,
                    borderBottom: "1px solid",
                    borderColor: (theme.vars || theme).palette.grey[500],
                    borderTopLeftRadius: 0,
                    borderTopRightRadius: 0
                    // borderColor: "background.level1",
                    // boxShadow: "sm"
                })}
            >
                <GlobalStyles
                    styles={theme => ({
                        ":root": {
                            "--Header-height": "52px",
                            [theme.breakpoints.up("md")]: {
                                "--Header-height": "0px"
                            }
                        }
                    })}
                />
                <Button
                    onClick={() => toggleSidebar()}
                    variant="outlined"
                    color="primary"
                    size="small"
                >
                    <MenuRounded />
                </Button>
            </Paper>
            <Box
                sx={{
                    px: {
                        xs: 2,
                        md: 6
                    }
                }}
            >
                <Breadcrumbs
                    aria-label="breadcrumbs"
                    separator={
                        <ChevronRightRounded />
                    }
                    sx={{
                        pl: 0
                    }}
                >
                    <MUILink
                        component={Link}
                        underline="none"
                        color={navigationContext?.route?.length ? "neutral" : "primary"}
                        sx={{
                            display: "flex",
                            "::before": {
                                display: "none"
                            }
                        }}

                        to="/home"
                    >
                        <DashboardRounded />
                    </MUILink>
                    {navigationContext?.route?.map((x, i, a) => (
                        i != a.length - 1 ?
                            <MUILink
                                component={Link}
                                to={x.href}
                                key={i}
                                underline="hover"
                                color="neutral"
                                sx={{
                                    fontSize: 12,
                                    fontWeight: 500,
                                }}
                            >
                                <Typography
                                    noWrap
                                    maxWidth={30}
                                >
                                    {x.name}
                                </Typography>
                            </MUILink>
                            :
                            <Typography
                                color="primary"
                                component="div"
                                sx={{
                                    fontSize: 12,
                                    fontWeight: 500
                                }}
                                noWrap
                                maxWidth={300}
                            >
                                {x.name}
                            </Typography>
                    ))}
                </Breadcrumbs>
                <Typography
                    variant="h2"
                    component="h1"
                    sx={{
                        mt: 1,
                        mb: 2,
                        overflowWrap: "break-word"
                    }}

                >
                    {navigationContext?.title}
                </Typography>
            </Box>
        </Box>
    );
};
