import { EditRounded } from "@mui/icons-material";
import { Box, Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Divider, FormControl, FormLabel, IconButton, MenuItem, OutlinedInput, Paper, Select, Stack, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from "@mui/material";
import { useState, type ReactNode } from "react";
import { Link, useNavigate } from "react-router";
import { APIManager, type CameraObject, type DoorwayObject } from "~/managers/APIManager";

interface FormElements extends HTMLFormControlsCollection {
    name: HTMLInputElement;
    doorwayID: HTMLInputElement;
}

interface RoomEditorFormElement extends HTMLFormElement {
    readonly elements: FormElements;
}


export const AllCamerasPage = ({ cameras }: { cameras: CameraObject[]; }): ReactNode => {
    const [doorwayNames, setDoorwayNames] = useState(new Map());
    const [roomNames, setRoomNames] = useState(new Map());
    const [editorOpen, setEditorOpen] = useState(false);
    const navigate = useNavigate();

    const [editorName, setEditorName] = useState("");
    const [editorDoorway, setEditorDoorway] = useState("");
    const [editorID, setEditorID] = useState("");
    const [editorAllDoorways, setEditorAllDoorways] = useState<DoorwayObject[]>([]);

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

    const loadDoorwayName = async (id: string) => {
        let doorway = await APIManager.Doorway.get(id);
        if (doorway) {
            const dupeOrgNames = new Map(doorwayNames);
            dupeOrgNames.set(id, `${doorway.inRoomID ? getRoomName(doorway.inRoomID) : "nowhere"} to ${doorway.outRoomID ? getRoomName(doorway.outRoomID) : "nowhere"}`);
            setDoorwayNames(dupeOrgNames);
        }
    };

    const getDoorwayName = (id: string) => {
        if (doorwayNames.has(id)) return doorwayNames.get(id);
        else loadDoorwayName(id);
        return id;
    };

    const closeEditor = () => {
        setEditorOpen(false);
    };

    const openEditorFor = async (id: string) => {
        setEditorID(id);
        let camera = cameras.find(x => x.id == id)!;
        setEditorName(camera.name);
        setEditorDoorway(camera.location);

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
                        edit camera
                    </DialogTitle>
                    <DialogContent>
                        <DialogContentText>
                            use the fields below to change the camera's properties!
                        </DialogContentText>
                        <Divider
                            sx={{
                                my: 2,
                                mx: -3
                            }}
                        />
                        <form
                            id="camera-editor"
                            onSubmit={async (e: React.SubmitEvent<RoomEditorFormElement>) => {
                                e.preventDefault();

                                // @ts-expect-error
                                let camera: CameraObject = {
                                    id: editorID,
                                    name: editorName,
                                    location: editorDoorway,
                                };

                                await APIManager.Camera.patch(editorID, camera);

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
                                    <FormLabel>name</FormLabel>
                                    <OutlinedInput
                                        type="text"
                                        name="name"
                                        value={editorName}
                                        onChange={e => setEditorName(e.target.value)}
                                    />
                                </FormControl>

                                <FormControl
                                    required
                                    sx={{
                                        width: "100%"
                                    }}
                                >
                                    <FormLabel>doorway</FormLabel>
                                    <Select
                                        value={editorDoorway}
                                        onChange={e => setEditorDoorway(e.target.value)}
                                    >
                                        {editorAllDoorways.map(x => (
                                            <MenuItem
                                                key={x.id}
                                                value={x.id}
                                            >
                                                {getDoorwayName(x.id)} ({x.id})
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
                            form="camera-editor"
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
                            <TableCell>name</TableCell>
                            <TableCell align="right">id</TableCell>
                            <TableCell align="right">doorway</TableCell>
                            <TableCell align="right">edit</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {
                            cameras.map(x => (
                                <TableRow
                                    key={x.id}
                                >
                                    <TableCell>
                                        <Link
                                            to={`/camera/${x.id}`}
                                        >
                                            {x.name}
                                        </Link>
                                    </TableCell>
                                    <TableCell align="right">{x.id}</TableCell>
                                    <TableCell align="right">{getDoorwayName(x.location)}</TableCell>
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
