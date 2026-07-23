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
} from "react-aria-components";

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
    { id: 1, name: "user" },
    { id: 2, name: "demo" },
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
            autoFocus
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
            </Row>
          )}
        </TableBody>

        
      </Table>

     <span>
      <BsFillTrashFill />
      </span>
          
        
    </main>
  );
}
