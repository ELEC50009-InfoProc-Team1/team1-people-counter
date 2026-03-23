import { EditRounded } from "@mui/icons-material";
import { Box, Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Divider, FormControl, FormLabel, IconButton, OutlinedInput, Paper, Stack, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from "@mui/material";
import { useState, type ReactNode } from "react";
import { Link, useNavigate } from "react-router";
import { APIManager, type OrganisationObject } from "~/managers/APIManager";

interface FormElements extends HTMLFormControlsCollection {
    name: HTMLInputElement;
}

interface RoomEditorFormElement extends HTMLFormElement {
    readonly elements: FormElements;
}


export const AllOrganisationsPage = ({ organisations }: { organisations: OrganisationObject[]; }): ReactNode => {
    const [editorOpen, setEditorOpen] = useState(false);
    const navigate = useNavigate();

    const [editorName, setEditorName] = useState("");
    const [editorID, setEditorID] = useState("");

    const closeEditor = () => {
        setEditorOpen(false);
    };

    const openEditorFor = async (id: string) => {
        setEditorID(id);
        let room = organisations.find(x => x.id == id)!;
        setEditorName(room.name);

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
                        edit organisation
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

                                let organisation: OrganisationObject = {
                                    id: editorID,
                                    name: editorName,
                                };

                                await APIManager.Organisation.patch(editorID, organisation);

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
                            <TableCell align="right">edit</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {
                            organisations.map(x => (
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
