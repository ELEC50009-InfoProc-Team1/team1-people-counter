import { Avatar, Box, Button, Skeleton, Tooltip, Typography } from "@mui/material";
import { useContext, useState, type ReactNode } from "react";
import { AuthGuardUserContext } from "../context/AuthGuardUserContext";
import { LogoutRounded } from "@mui/icons-material";
import { AuthManager } from "~/managers/AuthManager";
import { useNavigate } from "react-router";

export const SidebarProfile = (): ReactNode => {
    const { me } = useContext(AuthGuardUserContext)!;
    const [tryingToLogOut, setTryingToLogOut] = useState<boolean>(false);
    const [logoutErrorTooltip, setLogoutErrorTooltip] = useState<string | undefined>(undefined);
    const navigate = useNavigate();

    return (
        <Box
            sx={{
                display: "flex",
                gap: 2,
                alignItems: "center"
            }}
        >
            <Avatar
                variant="circular"
                onClick={() => navigate(`/users/${encodeURIComponent(me.id || "")}`)}
                sx={{
                    cursor: "pointer"
                }}
            >
                {me.name![0]?.toString?.().toUpperCase()}
            </Avatar>
            <Box
                sx={{
                    minWidth: 0,
                    flex: 1,
                    cursor: "pointer"
                }}
                onClick={() => navigate(`/users/${encodeURIComponent(me.id || "")}`)}
            >
                <Typography
                    variant="h5"
                    noWrap
                >
                    {me.name || <Skeleton>usernameeeee</Skeleton>}
                </Typography>
            </Box>
            <Tooltip
                title={logoutErrorTooltip}
                arrow
            >
                <Button
                    size="medium"
                    variant="outlined"
                    color="error"
                    onClick={() => {
                        AuthManager.logout().then(x => {
                            if (x) navigate("/");
                            else {
                                setLogoutErrorTooltip("couldn't log out");
                            }
                        }).finally(() => {
                            setTryingToLogOut(false);
                        });
                        setTryingToLogOut(true);
                    }}
                    disabled={tryingToLogOut}
                    sx={theme => ({
                        ["& > svg"]: {
                            fill: (theme.vars || theme).palette.error.main
                        }
                    })}
                >
                    <LogoutRounded />
                </Button>
            </Tooltip>
        </Box>
    );
};
