import { EditRounded } from "@mui/icons-material";
import { Box, Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Divider, FormControl, FormLabel, IconButton, MenuItem, OutlinedInput, Paper, Select, Stack, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from "@mui/material";
import { useState, type ReactNode } from "react";
import { Link, useNavigate } from "react-router";
import { APIManager, type FloorObject, type RoomObject } from "~/managers/APIManager";

interface FormElements extends HTMLFormControlsCollection {
    name: HTMLInputElement;
    floorID: HTMLInputElement;
    maxCapacity: HTMLInputElement;
    currentNoOfPeople: HTMLInputElement;
}

interface RoomEditorFormElement extends HTMLFormElement {
    readonly elements: FormElements;
}


export const AllRoomsPage = ({ rooms }: { rooms: RoomObject[]; }): ReactNode => {
    const [floorNames, setFloorNames] = useState(new Map());
    const [editorOpen, setEditorOpen] = useState(false);
    const navigate = useNavigate();

    const [editorName, setEditorName] = useState("");
    const [editorFloor, setEditorFloor] = useState("");
    const [editorMaxCapacity, setEditorMaxCapacity] = useState(0);
    const [editorCurrentNumber, setEditorCurrentNumber] = useState(0);
    const [editorID, setEditorID] = useState("");
    const [editorAllFloors, setEditorAllFloors] = useState<FloorObject[]>([]);

    const loadFloorName = async (id: string) => {
        let floor = await APIManager.Floor.get(id);
        if (floor) {
            const dupeFloorNames = new Map(floorNames);
            dupeFloorNames.set(id, floor.name);
            setFloorNames(dupeFloorNames);
        }
    };

    const getFloorName = (id: string) => {
        if (floorNames.has(id)) return floorNames.get(id);
        else loadFloorName(id);
        return id;
    };

    const closeEditor = () => {
        setEditorOpen(false);
    };

    const openEditorFor = async (id: string) => {
        setEditorID(id);
        let room = rooms.find(x => x.id == id)!;
        setEditorName(room.name);
        setEditorFloor(room.floorID);
        setEditorMaxCapacity(room.maxCapacity);
        setEditorCurrentNumber(room.currentNoOfPeople);

        if (!editorAllFloors.length) {
            let floors = await APIManager.Floor.all();
            setEditorAllFloors(floors);
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
                        edit room
                    </DialogTitle>
                    <DialogContent>
                        <DialogContentText>
                            use the fields below to change the room's properties!
                        </DialogContentText>
                        <Divider
                            sx={{
                                my: 2,
                                mx: -3
                            }}
                        />
                        <form
                            id="room-editor"
                            onSubmit={async (e: React.SubmitEvent<RoomEditorFormElement>) => {
                                e.preventDefault();

                                let room: RoomObject = {
                                    id: editorID,
                                    name: editorName,
                                    currentNoOfPeople: editorCurrentNumber,
                                    floorID: editorFloor,
                                    maxCapacity: editorMaxCapacity
                                };

                                await APIManager.Room.patch(editorID, room);

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
                                    <FormLabel>max capacity</FormLabel>
                                    <OutlinedInput
                                        type="number"
                                        name="maxCapacity"
                                        value={editorMaxCapacity}
                                        onChange={e => setEditorMaxCapacity(Math.max(0, parseInt(e.target.value)))}
                                    />
                                </FormControl>

                                <FormControl
                                    required
                                    sx={{
                                        width: "100%"
                                    }}
                                >
                                    <FormLabel>current occupancy</FormLabel>
                                    <OutlinedInput
                                        type="number"
                                        name="currentNoOfPeople"
                                        value={editorCurrentNumber}
                                        onChange={e => setEditorCurrentNumber(Math.max(0, parseInt(e.target.value)))}
                                    />
                                </FormControl>

                                <FormControl
                                    required
                                    sx={{
                                        width: "100%"
                                    }}
                                >
                                    <FormLabel>floor</FormLabel>
                                    <Select
                                        value={editorFloor}
                                        onChange={e => setEditorFloor(e.target.value)}
                                    >
                                        {editorAllFloors.map(x => (
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
                            form="room-editor"
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
                            <TableCell align="right">current occupancy</TableCell>
                            <TableCell align="right">max capacity</TableCell>
                            <TableCell align="right">floor</TableCell>
                            <TableCell align="right">edit</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {
                            rooms.map(x => (
                                <TableRow
                                    key={x.id}
                                >
                                    <TableCell>
                                        <Link
                                            to={`/room/${x.id}`}
                                        >
                                            {x.name}
                                        </Link>
                                    </TableCell>
                                    <TableCell align="right">{x.id}</TableCell>
                                    <TableCell align="right">{x.currentNoOfPeople}</TableCell>
                                    <TableCell align="right">{x.maxCapacity}</TableCell>
                                    <TableCell align="right">{getFloorName(x.floorID)}</TableCell>
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
