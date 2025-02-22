import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { IFolderModel, IMinisterModel, ISystemMessageModel, IUserModel } from 'tno-core';

import { IProfileState } from './interfaces';

export const initialProfileState: IProfileState = {
  myFolders: [],
  myMinisters: [],
  systemMessages: [],
};

export const profileSlice = createSlice({
  name: 'profile',
  initialState: initialProfileState,
  reducers: {
    storeMyProfile(state: IProfileState, action: PayloadAction<IUserModel | undefined>) {
      state.profile = action.payload;
    },
    storeMyFolders(state: IProfileState, action: PayloadAction<IFolderModel[]>) {
      state.myFolders = action.payload;
    },
    storeMyMinisters(state: IProfileState, action: PayloadAction<IMinisterModel[]>) {
      state.myMinisters = action.payload;
    },
    storeSystemMessages(state: IProfileState, action: PayloadAction<ISystemMessageModel[]>) {
      state.systemMessages = action.payload;
    },
  },
});

export const { storeMyProfile, storeMyFolders, storeMyMinisters, storeSystemMessages } =
  profileSlice.actions;
