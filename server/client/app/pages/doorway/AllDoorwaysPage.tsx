import { EditRounded } from "@mui/icons-material";
import { Box, Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Divider, FormControl, FormLabel, IconButton, MenuItem, Paper, Select, Stack, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from "@mui/material";
import { useState, type ReactNode } from "react";
import { useNavigate } from "react-router";
import { APIManager, type DoorwayObject, type RoomObject } from "~/managers/APIManager";

interface FormElements extends HTMLFormControlsCollection {
    name: HTMLInputElement;
    roomID: HTMLInputElement;
}

interface RoomEditorFormElement extends HTMLFormElement {
    readonly elements: FormElements;
}


export const AllDoorwaysPage = ({ doorways }: { doorways: DoorwayObject[]; }): ReactNode => {
    const [roomNames, setRoomNames] = useState(new Map());
    const [editorOpen, setEditorOpen] = useState(false);
    const navigate = useNavigate();

    const [editorInRoom, setEditorInRoom] = useState<string | undefined>("");
    const [editorOutRoom, setEditorOutRoom] = useState<string | undefined>("");
    const [editorID, setEditorID] = useState("");
    const [editorAllRooms, setEditorAllRooms] = useState<RoomObject[]>([]);

    const loadRoomName = async (id: string) => {
        let room = await APIManager.Room.get(id);
        if (room) {
            const dupeOrgNames = new Map(roomNames);
            dupeOrgNames.set(id, room.name);
            setRoomNames(dupeOrgNames);
        }
    };

    const getRoomName = (id: string) => {
        if (roomNames.has(id)) return roomNames.get(id);
        else loadRoomName(id);
        return id;
    };

    const closeEditor = () => {
        setEditorOpen(false);
    };

    const openEditorFor = async (id: string) => {
        setEditorID(id);
        let doorway = doorways.find(x => x.id == id)!;
        setEditorInRoom(doorway.inRoomID);
        setEditorOutRoom(doorway.outRoomID);

        if (!editorAllRooms.length) {
            let rooms = await APIManager.Room.all();
            setEditorAllRooms(rooms);
        }

        setEditorOpen(true);
    };

    return (
        <Box
            sx={{
                px: {
                    xs: 2,
                    md: 6
                }
            }}
        >
            <TableContainer
                component={Paper}
            >
                <Dialog
                    open={editorOpen}
                    onClose={closeEditor}
                >
                    <DialogTitle>
                        edit doorway
                    </DialogTitle>
                    <DialogContent>
                        <DialogContentText>
                            use the fields below to change the doorway's properties!
                        </DialogContentText>
                        <Divider
                            sx={{
                                my: 2,
                                mx: -3
                            }}
                        />
                        <form
                            id="doorway-editor"
                            onSubmit={async (e: React.SubmitEvent<RoomEditorFormElement>) => {
                                e.preventDefault();

                                let doorway: DoorwayObject = {
                                    id: editorID,
                                    inRoomID: editorInRoom,
                                    outRoomID: editorOutRoom
                                };

                                await APIManager.Doorway.patch(editorID, doorway);

                                // refresh
                                navigate(0);
                            }}
                        >
                            <Stack
                                gap={1}
                            >
                                <FormControl
                                    required
                                    sx={{
                                        width: "100%"
                                    }}
                                >
                                    <FormLabel>in room</FormLabel>
                                    <Select
                                        value={editorInRoom}
                                        onChange={e => setEditorInRoom(e.target.value)}
                                    >
                                        {[...editorAllRooms, { id: "", name: "---" }].map(x => (
                                            <MenuItem
                                                key={x.id}
                                                value={x.id}
                                            >
                                                {x.name} ({x.id})
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                                <FormControl
                                    required
                                    sx={{
                                        width: "100%"
                                    }}
                                >
                                    <FormLabel>out room</FormLabel>
                                    <Select
                                        value={editorInRoom}
                                        onChange={e => setEditorOutRoom(e.target.value)}
                                    >
                                        {[...editorAllRooms, { id: "", name: "---" }].map(x => (
                                            <MenuItem
                                                key={x.id}
                                                value={x.id}
                                            >
                                                {x.name} ({x.id})
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                            </Stack>
                        </form>
                    </DialogContent>
                    <DialogActions>
                        <Button
                            onClick={closeEditor}
                        >
                            cancel
                        </Button>
                        <Button
                            type="submit"
                            form="doorway-editor"
                            variant="contained"
                            color="primary"
                        >
                            submit
                        </Button>
                    </DialogActions>
                </Dialog>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell align="right">id</TableCell>
                            <TableCell align="right">in room</TableCell>
                            <TableCell align="right">out room</TableCell>
                            <TableCell align="right">edit</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {
                            doorways.map(x => (
                                <TableRow
                                    key={x.id}
                                >
                                    <TableCell align="right">{x.id}</TableCell>
                                    <TableCell align="right">{x.inRoomID ? getRoomName(x.inRoomID) : "nowhere"}</TableCell>
                                    <TableCell align="right">{x.outRoomID ? getRoomName(x.outRoomID) : "nowhere"}</TableCell>
                                    <TableCell align="right">
                                        <IconButton
                                            onClick={() => {
                                                openEditorFor(x.id);
                                            }}
                                        >
                                            <EditRounded />
                                        </IconButton>
                                    </TableCell>
                                </TableRow>
                            ))
                        }
                    </TableBody>
                </Table>
            </TableContainer>
        </Box>
    );
};
