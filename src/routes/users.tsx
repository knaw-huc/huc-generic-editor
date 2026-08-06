import { useState } from "react";
import {
  BsFillTrashFill,
  BsFillPencilFill,
} from "react-icons/bs";
import {
  Button,
  DialogTrigger,
} from "react-aria-components";

import { createFileRoute } from "@tanstack/react-router";
import { UserFormModal } from "../components/UserModalForm";
import { createColumnHelper } from "@tanstack/react-table";
import PaginatedTable from "../components/PaginatedTable";
import {useSuspenseQuery} from "@tanstack/react-query";
import {useUsers} from "../queries/users.ts";

interface User {
  id: number;
  name: string;
  role?: string;
  eppn?: string;
  idp?: string;
  edupersontargetedid?: string;
}

export const Route = createFileRoute("/users")({
  component: Users,
  loader: ({context}) => {
    context.queryClient.ensureQueryData(useUsers())
  }
});

export default function Users() {
  type UserFormData = {
    name: string;
    role: string;
    eppn: string;
    idp: string;
    edupersontargetedid: string;
  };

  // standard users
  // const [users, setUsers] = useState<User[]>([
  //   { id: 1, name: "user", role: "student" },
  //   { id: 2, name: "demo", role: "postdoc" },
  // ]);

  const {data : users} = useSuspenseQuery(useUsers());


  // columns for the table
  const columnHelper = createColumnHelper<User>();

  const columns = [
    columnHelper.accessor("id", {
      header: () => "ID",
      cell: (info) => info.getValue(),
    }),

    columnHelper.accessor("name", {
      header: () => "Name",
      cell: (info) => info.getValue(),
    }),

    columnHelper.accessor("role", {
      header: () => "Role",
      cell: (info) => info.getValue(),
    }),

    columnHelper.accessor("eppn", {
      header: () => "eppn",
      cell: (info) => info.getValue(),
    }),

    columnHelper.accessor("idp", {
      header: () => "idp",
      cell: (info) => info.getValue(),
    }),

    columnHelper.accessor("edupersontargetedid", {
      header: () => "edupersontargetedid",
      cell: (info) => info.getValue(),
    }),


    columnHelper.display({
      id: "actions",
      header: () => "Actions",
      cell: ({ row }) => (
        <>
          <Button onPress={() => startEditing(row.original)}><BsFillPencilFill /> Edit</Button>

          <Button onPress={() => handleDelete(row.original.id)}><BsFillTrashFill /> Delete</Button>
        </>
      ),
    }),
  ];

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

      <PaginatedTable columns={columns} data={users} />

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
