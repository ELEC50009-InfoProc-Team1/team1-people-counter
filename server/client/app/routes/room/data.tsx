import { getDefaultMeta } from "~/util/defaultMeta";
import type { Route } from "./+types/data";
import { APIManager } from "~/managers/APIManager";
import { redirect } from "react-router";
import { RoomDataPage } from "~/pages/room/RoomDataPage";

export function meta({ }: Route.MetaArgs) {
    return getDefaultMeta();
}

export async function clientLoader({ params }: Route.ClientLoaderArgs) {
    const room = await APIManager.Room.get(params.roomID);

    if (!room) redirect("/home");
    return room;
}

export default function RoomData({ loaderData }: Route.ComponentProps) {
    return (
        <RoomDataPage
            room={loaderData!}
        />
    );
}
