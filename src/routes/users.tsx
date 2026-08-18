import { useState } from "react";
import {
  BsFillTrashFill,
  BsFillPencilFill,
} from "react-icons/bs";
import {
  Button,
  DialogTrigger,
} from "react-aria-components";


import {createFileRoute, Link,} from "@tanstack/react-router";
import {type UserFormData, UserFormModal} from "../components/UserModalForm";
import { createColumnHelper } from "@tanstack/react-table";
import PaginatedTable from "../components/PaginatedTable";
import {useSuspenseQuery} from "@tanstack/react-query";
import {useUsers} from "../queries/users.ts";


import { useMutation, useQueryClient} from "@tanstack/react-query";
import {fetchAuthenticated} from "../auth.ts";


export interface User {
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


  // standard users
  const {data : users} = useSuspenseQuery(useUsers());

  // columns for the table
  const columnHelper = createColumnHelper<User>();

  const columns = [

    columnHelper.accessor("id", {
      header: () => "id",
      cell: (info) => info.getValue(),
    }),

    columnHelper.accessor("name", {
      header: () => "Name",
      cell: (info) => info.getValue(),
    }),

    columnHelper.accessor("role", {
      header: () => "Role (NI)",
      cell: (info) => info.getValue(),
    }),

    columnHelper.accessor("eppn", {
      header: () => "eppn (NI)",
      cell: (info) => info.getValue(),
    }),

    columnHelper.accessor("idp", {
      header: () => "idp (NI)",
      cell: (info) => info.getValue(),
    }),

    columnHelper.accessor("edupersontargetedid", {
      header: () => "edupersontargetedid(NI)",
      cell: (info) => info.getValue(),
    }),


    columnHelper.display({
      id: "actions",
      header: () => "Actions",
      cell: ({ row }) => (
        <>
          <Button onPress={() => startEditing(row.original)}><BsFillPencilFill /> Edit</Button>

          <Button
          onPress={() => deleteUserMutation.mutate(row.original.id)}>
            <BsFillTrashFill /> Delete</Button>
        </>
      ),
    }),
  ];



  const queryClient = useQueryClient();

  // create new user
  const addUserMutation = useMutation({
    mutationFn: async (user: UserFormData) => {

      console.log("1. addUserMutation called with user", user);
      const response = await fetchAuthenticated("http://localhost:1210/app/tastadev1/auth/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(user),
      });

      // console.log("2. response status:", response.status);

      if (!response.ok) {
        const errorText = await response.text();

        console.error("API error:", {
          status: response.status,
          body: errorText,
        });

        throw new Error(
            `Failed to add user: ${response.status} ${errorText}`
        );
      }

      return response.json();
    },

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["users"]
      })
    }

  });


  // react state newUser
  const [newUser, setNewUser] = useState<UserFormData>({
    name: "",
  });


  const addUser = () => {
    addUserMutation.mutate(newUser);

  };

  // //edit users

  // const [editingUser, setEditingUser] = useState<User | null>(null);
  const [formData, setFormData] = useState<UserFormData>({
    name: "",
  });
  const [isEditOpen, setIsEditOpen] = useState(false);

  const [originalUserId, setOriginalUserId] = useState<number | null>(null);


  const updateUserMutation = useMutation({
    mutationFn: async ({originalId, user}: {originalId: number;
    user: UserFormData;}) => {
      const response = await fetchAuthenticated(`http://localhost:1210/app/tastadev1/auth/users/${originalId}`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",

            },
            body: JSON.stringify({
              name: user.name,
            }),
          });

      return response.json();
    },

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["users"],
      });

      setIsEditOpen(false);
    },
  });



  const startEditing = (user: User) => {
    // setEditingUser({...user});
    setOriginalUserId(user.id);

    setFormData({
      name: user.name,
      role: user.role ?? "",
      eppn: user.eppn ?? "",
      idp: user.idp ?? "",
      edupersontargetedid: user.eppn ?? ""
    });
    setIsEditOpen(true);
  };

  const handleSave = (updatedUser: UserFormData) => {
    if (originalUserId === null) {
      return;
    }

    updateUserMutation.mutate({
      originalId: originalUserId,
      user: updatedUser,
    });
  };



  // delete button function
  const deleteUserMutation = useMutation({
    mutationFn: async (userId: number) => {
      const response = await fetchAuthenticated(`http://localhost:1210/app/tastadev1/auth/users/${userId}`,
          {
            method: "DELETE",
          }
          );

      return response.json();

    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["users"]
      })
    }
  })

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

      <div>

        <Link
            to="/me"
        >
          Current user
        </Link>

      </div>

      <PaginatedTable columns={columns} data={users} />

      {formData && (
        <DialogTrigger isOpen={isEditOpen} onOpenChange={setIsEditOpen}>
          <UserFormModal
            title="Edit user"
            user={formData}
            setUser={setFormData}
            onSave={handleSave}
          />
        </DialogTrigger>
      )}
    </main>
  );
}
