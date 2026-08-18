import {
  Dialog,
  Heading,
  Form,
  TextField,
  Label,
  Input,
  Button,
} from "react-aria-components";

import { Modal } from "./Modal";
import type {User} from "../routes/users.tsx";




interface UserFormModalProps {
  title: string;
  user: UserFormData;
  setUser: React.Dispatch<React.SetStateAction<UserFormData>>;
  onSave: (user: User) => void;
}
export interface UserFormData {
    name: string;
    role?: string;
    eppn?: string;
    idp?: string;
    edupersontargetedid?: string;
}

export function UserFormModal({
  title,
  user,
  setUser,
  onSave,
}: UserFormModalProps) {
  return (
    <Modal>
      <Dialog>
        <Heading slot="title">{title}</Heading>

        <Form>

          <TextField isRequired autoFocus>
            <Label>Name (required)</Label>
            <Input
              value={user.name}
              onChange={(e) =>
                setUser((prev) => ({
                  ...prev,
                  name: e.target.value,
                }))
              }
            />
          </TextField>

          <TextField>
            <Label>Role (NI)</Label>
            <Input
              value={user.role}
              onChange={(e) =>
                setUser((prev) => ({
                  ...prev,
                  role: e.target.value,
                }))
              }
            />
          </TextField>

          <TextField>
            <Label>eppn (NI)</Label>
            <Input
              value={user.eppn}
              onChange={(e) =>
                setUser((prev) => ({
                  ...prev,
                  eppn: e.target.value,
                }))
              }
            />
          </TextField>

          <TextField>
            <Label>idp (NI)</Label>
            <Input
              value={user.idp}
              onChange={(e) =>
                setUser((prev) => ({
                  ...prev,
                  idp: e.target.value,
                }))
              }
            />
          </TextField>

          <TextField>
            <Label>edupersontargetedid (NI)</Label>
            <Input
              value={user.edupersontargetedid}
              onChange={(e) =>
                setUser((prev) => ({
                  ...prev,
                  edupersontargetedid: e.target.value,
                }))
              }
            />
          </TextField>

          <div
            style={{
              display: "flex",
              gap: 8,
              justifyContent: "flex-end",
            }}
          >
            <Button slot="close">Cancel</Button>
            <Button slot="close" onPress={ () => onSave(user)}>
              Done
            </Button>
          </div>
        </Form>
      </Dialog>
    </Modal>
  );
}