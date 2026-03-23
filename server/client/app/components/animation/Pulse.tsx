import { styled } from "@mui/material";

export const Pulse = styled("div")({
    "@keyframes pulse": {
        "0%": {
            transform: "scale(0.95)",
            boxShadow: "0 0 0 0 var(--Pulse-visible)"
        },
        "70%": {
            transform: "scale(1)",
            boxShadow: "0 0 0 var(--Pulse-distance) var(--Pulse-invisible)"
        },
        "100%": {
            transform: "scale(0.95)",
            boxShadow: "0 0 0 0 var(--Pulse-invisible)"
        }
    },
    boxShadow: "0 0 0 0 var(--Pulse-full-visible)",
    transform: "scale(1)",
    animation: "pulse 2s infinite"
});
