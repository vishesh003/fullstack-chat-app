import React, { useEffect, useRef } from 'react';
import { useChatStore } from '../store/useChatStore';
import { useAuthStore } from '../store/useAuthStore';

import ChatHeader from './ChatHeader';
import MessageInput from './MessageInput';
import MessageSkeleton from './skeleton/MessageSkeleton';
import { formatMessageTime } from '../lib/utils';

function ChatContainer() {

  const {
    messages,
    getMessages,
    isMessagesLoading,
    selectedUser,
    subscribeToMessages,
    unsubscribeFromMessages
  } = useChatStore();

  const { authUser } = useAuthStore();

  const messageEndRef = useRef(null);

  useEffect(() => {

    if (selectedUser?._id) {
      getMessages(selectedUser._id);

      subscribeToMessages();
    }

    return () => unsubscribeFromMessages();

  }, [
    selectedUser,
    getMessages,
    subscribeToMessages,
    unsubscribeFromMessages
  ]);

  useEffect(() => {

    if (messageEndRef.current && messages) {

      messageEndRef.current.scrollIntoView({
        behavior: "smooth"
      });

    }

  }, [messages]);

  // No selected chat
  if (!selectedUser) {
    return (
      <div className='flex-1 flex items-center justify-center'>
        <p className='text-base-content/60'>
          Select a chat to start messaging
        </p>
      </div>
    );
  }

  // Loading state
  if (isMessagesLoading) {
    return (
      <div className='flex-1 flex flex-col overflow-auto'>
        <ChatHeader />
        <MessageSkeleton />
        <MessageInput />
      </div>
    );
  }

  return (

    <div className='flex-1 flex flex-col overflow-auto'>

      <ChatHeader />

      <div className='flex-1 overflow-y-auto p-4 space-y-4'>

        {messages.map((message) => (

          <div
            key={message._id}
            className={`chat ${
              message.senderId === authUser._id
                ? "chat-end"
                : "chat-start"
            }`}
          >

            {/* Avatar */}
            <div className='chat-image avatar'>

              <div className='size-10 rounded-full border'>

                <img
                  src={
                    message.senderId === authUser._id
                      ? authUser.profilePic || "/Profile.png"
                      : selectedUser.profilePic || "/Profile.png"
                  }
                  alt='profile'
                />

              </div>

            </div>

            {/* Time */}
            <div className='chat-header mb-1'>

              <time className='text-xs opacity-50 ml-1'>
                {formatMessageTime(message.createdAt)}
              </time>

            </div>

            {/* Bubble */}
            <div className='chat-bubble flex flex-col'>

              {message.image && (

                <img
                  src={message.image}
                  alt='Attachment'
                  className='sm:max-w-[200px] rounded-md mb-2'
                />

              )}

              {message.text && (
                <p>{message.text}</p>
              )}

            </div>

          </div>
        ))}

        <div ref={messageEndRef} />

      </div>

      <MessageInput />

    </div>
  );
}

export default ChatContainer;