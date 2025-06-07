// src/lib/aiChat.ts
import apolloClient from '@/lib/apolloClient';
import { gql } from '@apollo/client';
import { Message, ToolInvocation, Attachment } from 'ai';  // ← pull in these types
import { v4 as uuid } from 'uuid';

/* ——— GraphQL mutations ——— */
const CREATE_CHAT = gql`
  mutation CreateChat($data: ChatCreateInput!) {
    createChat(data: $data) {
      id
    }
  }
`;

const UPDATE_CHAT = gql`
  mutation UpdateChat($id: ID!, $data: ChatUpdateInput!) {
    updateChat(where: { id: $id }, data: $data) {
      id
    }
  }
`;

/* ——— helpers ——— */
export function messagesToJSON(messages: Message[]) {
  return messages.map((m) => {
    // start with the basics
    const base: unknown = {
      id:      m.id ?? uuid(),
      role:    m.role,
      content: m.content,
    };

    // carry through any tool results (so your cards render later)
    if ((m as unknown).toolInvocations) {
      base.toolInvocations = (m as unknown).toolInvocations as ToolInvocation[];
    }

    // carry through attachments too, if you ever use them
    if ((m as unknown).experimental_attachments) {
      base.attachments = (m as unknown).experimental_attachments as Attachment[];
    }

    return base;
  });
}

/**
 * Create a brand-new chat in Keystone.
 */
export async function createChat({
  userId,
  title,
  messages,
}: {
  userId: string;
  title: string;
  messages: Message[];
}): Promise<string> {
  const json = messagesToJSON(messages);
  console.log('💾 createChat → variables:', { title, messagesCount: json.length, userId });
  const { data } = await apolloClient.mutate({
    mutation: CREATE_CHAT,
    variables: {
      data: {
        title,
        messages: json,
        createdBy: { connect: { id: userId } },
      },
    },
  });
  console.log('💾 createChat succeeded, id:', data.createChat.id);
  return data.createChat.id as string;
}

/**
 * Update an existing chat in Keystone.
 */
export async function updateChat({
  id,
  title,
  messages,
}: {
  id: string;
  title: string;
  messages: Message[];
}): Promise<void> {
  const json = messagesToJSON(messages);
  const vars = { id, data: { title, messages: json } };
  console.log('💾 updateChat → variables:', vars);
  const { data } = await apolloClient.mutate({
    mutation: UPDATE_CHAT,
    variables: vars,
  });
  console.log('💾 updateChat succeeded, id:', data.updateChat.id);
}

// default export is just updateChat; createChat is imported explicitly where needed
export default updateChat;
