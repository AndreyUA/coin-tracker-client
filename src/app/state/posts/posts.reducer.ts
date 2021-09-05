import { Action, createReducer, on } from '@ngrx/store';

import {
  setAllPosts,
  resetPosts,
  addNewPost,
  removePost,
} from './posts.actions';

export interface IPost {
  date: string;
  family: string;
  isRemoved: boolean;
  name: string;
  text: string;
  __v: number;
  _id: string;
}

export interface IPosts {
  allPosts: [] | Array<IPost>;
}

// TODO: add isFetching
const initialState: IPosts = {
  allPosts: [],
};

const _postsReducer = createReducer(
  initialState,
  on(setAllPosts, (state, { posts }) => ({
    ...state,
    allPosts: posts,
  })),
  on(addNewPost, (state, { post }) => ({
    ...state,
    allPosts: [post, ...state.allPosts],
  })),
  on(removePost, (state, { postId }) => ({
    ...state,
    allPosts: state.allPosts.filter((post) => post._id !== postId),
  })),
  on(resetPosts, (): any => ({ allPosts: [] }))
);

export function postsReducer(state: any, action: Action) {
  return _postsReducer(state, action);
}
