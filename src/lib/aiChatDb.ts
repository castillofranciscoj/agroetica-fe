// src/lib/aiChatDb.ts
import apolloClient from '@/lib/apolloClient';
import { gql } from '@apollo/client';
import type { CoreMessage } from 'ai';

const GET_CHAT_BY_ID = gql`
  query GetChatById($id: ID!) {
    chat(where: { id: $id }) {
      id
      title
      messages
      createdBy {
        id
        name
      }
      createdAt
    }
  }
`;

export type StoredChat = {
  id: string;
  title: string;
  messages: CoreMessage[];
  createdBy: { id: string; name?: string };
  createdAt: string;
};

export async function getChatById({ id }: { id: string }): Promise<StoredChat | null> {
  const { data } = await apolloClient.query<{ chat: unknown }>({
    query: GET_CHAT_BY_ID,
    variables: { id },
    fetchPolicy: 'no-cache',
  });
  if (!data.chat) return null;

  return {
    id:        data.chat.id,
    title:     data.chat.title,
    messages:  data.chat.messages as CoreMessage[],
    createdBy: data.chat.createdBy,
    createdAt: data.chat.createdAt,
  };
}

export const GET_MY_CHATS = gql`
  query GetMyChats($userId: ID!) {
    chats(
      where: { createdBy: { id: { equals: $userId } } }
      orderBy: { createdAt: desc }
    ) {
      id
      title
      createdAt
    }
  }
`;

export async function getMyChats(userId: string) {
  const { data, errors } = await apolloClient.query<{
    chats: { id: string; title: string; createdAt: string }[];
  }>({
    query: GET_MY_CHATS,
    variables: { userId },
    fetchPolicy: 'no-cache',
  });
  if (errors?.length) {
    console.error('❌ getMyChats errors:', errors);
    throw new Error(errors.map((e) => e.message).join(', '));
  }
  return data.chats;
}
