import React, { useEffect, useState } from 'react'
import Authenticated from './AuthenticatedLayout'
import { usePage } from '@inertiajs/react'
import ConversationItem from '@/Components/App/ConversationItem';
import { PencilSquareIcon } from '@heroicons/react/24/outline';
import TextInput from '@/Components/TextInput';
import { userEventBus } from '@/EventBus';

export default function ChatLayout({ children }) {

    const page = usePage();
    const conversations = page.props.conversations;
    const selectedConversation = page.props.selectedConversation;
    const [onlineUsers, setOnlineUsers] = useState({});
    const isUserOnline = userId => onlineUsers[userId];
    const [localConversations, setLocalConversations] = useState([]);
    const [sortedConversations, setSortedConversations] = useState([]);
    const {on} = userEventBus();

    const onSearch = ev => {
        const search = ev.target.value.toLowerCase();
        setLocalConversations(
            conversations.filter((conversation) => {
                return (
                    conversation.name.toLowerCase().includes(search)
                );
            })
        )
    }

    const messageCreated = (message) => {
        setLocalConversations((oldUsers) => {
            return oldUsers.map((u) => {
                if (message.receiver_id && u.is_user && (u.id == message.sender_id || u.id == message.receiver_id)) {
                    u.last_message = message.message;
                    u.last_message_date = message.created_at;
                    return u;
                }
                if (message.group_id && u.is_group && u.id == message.group_id) {
                    u.last_message = message.message;
                    u.last_message_date = message.created_at;
                    return u;
                }
                return u;
            })
        })
    }

    useEffect(() => {
        const offCreated = on("message.created", messageCreated);
        return () => {
            offCreated();
        }
    }, [on])

    useEffect(() => {
        setSortedConversations(
            localConversations.sort((a, b) => {
                if (a.blocked_at && b.blocked_at) {
                    return a.blocked_at > b.blocked_at ? 1 : -1;
                } else if (a.blocked_at) {
                    return 1;
                } else if (b.blocked_at) {
                    return -1;
                }

                if (a.last_message_date && b.last_message_date) {
                    return b.last_message_date.localeCompare(a.last_message_date);
                } else if (a.last_message_date) {
                    return -1;
                } else if (b.last_message_date) {
                    return 1;
                } else {
                    return 0;
                }
            })
        );
    }, [localConversations]);


    useEffect(() => {
        setLocalConversations(conversations);
    }, [conversations]);

    useEffect(() => {
        window.Echo.join("online").here(users => {
            const onlineUsers = Object.fromEntries(users.map((user) => [user.id, user]));
            setOnlineUsers(prevOnlineUsers => {
                return { ...prevOnlineUsers, ...onlineUsers };
            });
        }).joining(user => {
            setOnlineUsers((prevOnlieUsers) => {
                const updatedUsers = { ...prevOnlieUsers };
                updatedUsers[user.id] = user;
                return updatedUsers;
            });
        }).leaving(user => {
            setOnlineUsers((prevOnlieUsers) => {
                const updatedUsers = { ...prevOnlieUsers };
                delete updatedUsers[user.id];
                return updatedUsers;
            });
        }).error(err => {
            console.error(err);
        });

        return () => {
            window.Echo.leave("online");
        }
    }, []);

    return (
        <>
            <div className='flex'>
                <div className="flex w-full flex max-h-[calc(100vh-65px)] w-full md:w-[300px] lg:w-1/6">
                    <div className={`transition-all w-full bg-slate-800 flex flex-col overflow-hidden ${selectedConversation ? "-ml-[100%] sm:ml-0" : ""}`}>
                        <div className="flex flex-item-center justify-between py-2 px-3 text-xl font-medium">
                            <h3 className='text-white text-2xl font-bold'> My Conversations</h3>
                            <div className="tooltip tooltip-left" data-tip="Create new Group">
                                <button className="text-gray-400 hover:text-gray-200">
                                    <PencilSquareIcon className="w-4 h-4 inline-block ml-2" />
                                </button>
                            </div>
                        </div>
                        <div className="p-3">
                            <TextInput onKeyUp={onSearch} placeholder="Filter users and groups" className="w-full" />
                        </div>
                        <div className="flex-1 overflow-auto">
                            {sortedConversations && sortedConversations.map((conversation) => (
                                <ConversationItem key={`${conversation.is_group ? "group_" : "user_"}${conversation.id}`}
                                    conversation={conversation} online={!!isUserOnline(conversation.id)}
                                    selectedConversation={selectedConversation}
                                />
                            ))}
                        </div>
                    </div>
                </div>
                <div className="flex-1 flex flex-col h-[calc(100vh-65px)]">
                    {children}
                </div>
            </div>


        </>
    )
}
