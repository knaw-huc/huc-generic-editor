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

} from "react-aria-components";

import {createFileRoute} from "@tanstack/react-router";
import { UserFormModal } from "../components/UserModalForm";




interface User {
  id: number;
  name: string;
  role?: string;
  eppn?: string;
  idp?: string;
  edupersontargetedid?: string;
}

export const Route = createFileRoute('/users')({
    component: Users,
})

export default function Users() {
  type UserFormData = {
    name: string;
    role: string;
    eppn: string;
    idp: string;
    edupersontargetedid: string;
  };

  // standard users
  const [users, setUsers] = useState<User[]>([
    { id: 1, name: "user", role: "student" },
    { id: 2, name: "demo", role: "postdoc" },
  ]);

  // create new user
  // react state newUser
  const [newUser, setNewUser] = useState<UserFormData>({
    name: "",
    role: "",
    eppn: "",
    idp: "",
    edupersontargetedid: "",
  });

  // function is called when the button 'done' in the modal is pressed
  const addUser = () => {
    if (!newUser.name.trim()) {
      return;
    }

    setUsers((prev) => [
      ...prev,
      {
        id: Date.now(),
        ...newUser,
      },
    ]);

    setNewUser({
      name: "",
      role: "",
      eppn: "",
      idp: "",
      edupersontargetedid: "",
    });
  };

  // //edit users
  // edit dialog open state
  const [isEditOpen, setIsEditOpen] = useState(false);
  // state which stores which user is being edited
  const [editingUser, setEditingUser] = useState<User | null>(null);
  // state: what is currently in the edit form
  const [formData, setFormData] = useState<UserFormData>({
    name: "",
    role: "",
    eppn: "",
    idp: "",
    edupersontargetedid: "",
  });

  // function when edit button is pressed
  const startEditing = (user: User) => {
    setEditingUser(user);

    // copy users data into form
    setFormData({
      name: user.name ?? "",
      role: user.role ?? "",
      eppn: user.eppn ?? "",
      idp: user.idp ?? "",
      edupersontargetedid: user.edupersontargetedid ?? "",
    });

    setIsEditOpen(true);
  };

  // function when press done in modal
  const saveEdit = () => {
    if (!editingUser) return;

    setUsers((prev) =>
      prev.map((u) =>
        u.id === editingUser.id
          ? {
              ...u,
              ...formData,
            }
          : u,
      ),
    );

    setEditingUser(null);
  };

  // delete button function
  const handleDelete = (id: number) => {
    setUsers((prevUsers) => prevUsers.filter((user) => user.id !== id));
  };

  return (
    <main style={{ padding: "5rem" }}>
      <div className="header1">
        <h1>Users</h1>

        <DialogTrigger>
          <Button>Add user</Button>

          <UserFormModal
            title="Add user"
            user={newUser}
            setUser={setNewUser}
            onSave={addUser}
          />
        </DialogTrigger>
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
                  delete user
                </Button>

                <Button onPress={() => startEditing(user)}>
                  <BsFillPencilFill />
                  edit user
                </Button>
              </Cell>
            </Row>
          )}
        </TableBody>
      </Table>

      {editingUser && (
        <DialogTrigger isOpen={isEditOpen} onOpenChange={setIsEditOpen}>
          <UserFormModal
            title="Edit user"
            user={formData}
            setUser={setFormData}
            onSave={saveEdit}
          />
        </DialogTrigger>
      )}
    </main>
  );
}
