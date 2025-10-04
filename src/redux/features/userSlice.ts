import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

export interface User {
  id:               number | string;
  socials:          { [key: string]: number | null };
  messaging:        Messaging;
  compliance:       { [key: string]: number | null };
  branding:         { [key: string]: number | null };
  autooptions:      { [key: string]: boolean | null };
  preferences:      Preferences;
  password:         null;
  is_superuser:     boolean;
  is_staff:         boolean;
  is_active:        boolean;
  date_joined:      Date;
  rep_id:           string;
  rep_name:         string;
  company:          string;
  company_id:       number | string;
  address:          string;
  address2:         string;
  city:             string;
  state:            string;
  zip_code:         string;
  email:            string;
  work_phone:       string;
  work_ext:         string;
  cellphone:        string;
  first_name:       string;
  last_name:        string;
  title:            string;
  mid:              string;
  website:          string;
  account_folder:   string;
  branch_id:        string;
  industry_type:    string;
  groups:           any[];
  user_permissions: any[];
}

export interface Messaging {
  id:                     number | string;
  use_first_name:         null;
  change_phone_label:     null;
  no_emal_report:         null;
  last_sendgrid_download: null;
}

export interface Preferences {
  authentication:    boolean;
  authmode:          null;
  domain:            null;
  mailserver:        null;
  password:          null;
  port:              null;
  readsendgrid:      null;
  smtptimeout:       null;
  usernameinsubject: null;
  username:          null;
  usedeargreeting:   boolean;
}


interface UserState {
  currentUser: User | null;
}

const initialState: UserState = {
  currentUser: null,
};

// Redux Toolkit allows us to write "mutating" logic in reducers. It
// doesn't actually mutate the state because it uses the Immer library,
// which detects changes to a "draft state" and produces a brand new
// immutable state based off those changes
export const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    setCurrentUser: (state, action: PayloadAction<User>) => {
      state.currentUser = action.payload;
    },
  },
});

// Action creators are generated for each case reducer function
export const { setCurrentUser } = userSlice.actions;

export default userSlice.reducer;
