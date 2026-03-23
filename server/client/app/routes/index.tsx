import { Box, Button, Divider, Paper, Stack, Typography } from "@mui/material";
import type { Route } from "./+types/index";
import { getDefaultMeta } from "~/util/defaultMeta";
import { PeopleCounter } from "~/components/branding/PeopleCounter";
import { Link } from "react-router";
import { LoginRounded } from "@mui/icons-material";

export function meta({ }: Route.MetaArgs) {
    return getDefaultMeta();
}

export default function Home() {
    return (
        <Stack
            alignItems="center"
            justifyContent="center"
            sx={{
                height: "100vh",
            }}
        >
            <Box
                sx={{
                    ml: -2
                }}
            >
                <PeopleCounter />
            </Box>
            <Paper
                variant="outlined"
                sx={{
                    p: 2,
                }}
                component={Stack}
                maxWidth="300px"
            >
                <Typography
                    variant="h2"
                    sx={{
                        mb: 1
                    }}
                >
                    hello!
                </Typography>
                <Typography>
                    this is the server for team 1's submission. the primary frontend is on the
                    FPGAs themselves, and this site would be primarily used by system administrators
                    and for debugging.
                </Typography>
                <Divider
                    sx={{
                        mx: -2,
                        my: 2
                    }}
                />
                <Stack
                    justifyContent="end"
                    direction="row"
                >
                    <Button
                        variant="contained"
                        color="primary"
                        component={Link}
                        to="/login"
                        endIcon={
                            <LoginRounded />
                        }
                    >
                        login
                    </Button>
                </Stack>
            </Paper>
        </Stack>
    );
}
