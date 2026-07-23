import { useState } from "react";
import { BsFillTrashFill, BsFillPencilFill } from "react-icons/bs";
import {
  Cell,
  Column,
  Row,
  Table,
  TableBody,
  TableHeader,
  Button,
  DialogTrigger,
  Dialog,
  Heading,
  Form,
  TextField,
  Label,
  Input,
} from "react-aria-components";

import { Modal } from "./Modal";

interface User {
  id: number;
  name: string;
  role?: string;
  eppn?: string;
  idp?: string;
  edupersontargetedid?: string;
}

export default function App() {
  const [users, setUsers] = useState<User[]>([
    { id: 1, name: "user", role: "student" },
    { id: 2, name: "demo", role: "postdoc" },
  ]);

  const [editing, setEditing] = useState(false);
  const [newName, setNewName] = useState("");

  function startAdding() {
    setEditing(true);
    setNewName("");
  }

  function finishAdding() {
    if (newName.trim() === "") {
      setEditing(false);
      return;
    }

    setUsers([
      ...users,
      {
        id: users.length + 1,
        name: newName.trim(),
      },
    ]);

    setEditing(false);
    setNewName("");
  }

  const handleDelete = (id: number) => {
    setUsers((prevUsers) => prevUsers.filter((user) => user.id !== id));
  };

  const handleEdit = (id: number) => {
    setUsers((prevUsers) => prevUsers.filter((user) => user.id !== id));
  };

  function addUser() {
    const newUser: User = {
      id: users.length + 1,
      name: `User ${users.length + 1}`,
    };

    setUsers([...users, newUser]);
  }

  return (
    <main style={{ padding: "5rem" }}>
      <div className="header1">
        <h1>Users</h1>
        <Button onPress={startAdding}> add user </Button>

        {editing && (
          <input
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onBlur={finishAdding}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                finishAdding();
              }
            }}
          />
        )}
      </div>

      <Table aria-label="Users">
        <TableHeader>
          <Column isRowHeader>ID</Column>

          <Column>Name</Column>
          <Column>Role</Column>
          <Column>eppn</Column>
          <Column>idp</Column>
          <Column>edupersontargetedid</Column>
          <Column>actions</Column>
        </TableHeader>

        <TableBody items={users}>
          {(user) => (
            <Row id={user.id}>
              <Cell>{user.id}</Cell>
              <Cell>{user.name}</Cell>
              <Cell>{user.role}</Cell>
              <Cell>{user.eppn}</Cell>
              <Cell>{user.idp}</Cell>
              <Cell>{user.edupersontargetedid}</Cell>
              <Cell>
                <Button onPress={() => handleDelete(user.id)}>
                  <BsFillTrashFill />
                </Button>

                <DialogTrigger>
                  {/* <Button onPress={() => handleEdit(user.id)}> */}
                  <Button>
                    <BsFillPencilFill />
                  </Button>
                  <Modal>
                    <Dialog>
                      <Heading slot="title">edit the user</Heading>

                      <Form>
                        <TextField autoFocus>
                          <Label>name</Label>
                          <Input placeholder="Enter user name" />
                        </TextField>

                        <TextField>
                          <Label>role</Label>
                          <Input placeholder="Enter role" />
                        </TextField>

                        <div
                          style={{
                            display: "flex",
                            gap: 8,
                            alignSelf: "end",
                          }}
                        >
                          <Button slot="close">Cancel</Button>
                          <Button slot="close">done</Button>
                        </div>
                      </Form>
                    </Dialog>
                  </Modal>
                </DialogTrigger>
              </Cell>
            </Row>
          )}
        </TableBody>
      </Table>
    </main>
  );
}
