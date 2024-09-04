import ConversationHeader from '@/Components/App/ConversationHeader';
import MessageInput from '@/Components/App/MessageInput';
import MessageItem from '@/Components/App/MessageItem';
import { userEventBus } from '@/EventBus';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import ChatLayout from '@/Layouts/ChatLayout';
import { ChatBubbleLeftRightIcon } from '@heroicons/react/24/outline';
import { Head, usePage } from '@inertiajs/react';
import axios from 'axios';
import { useCallback, useEffect, useRef, useState } from 'react';


function Home({ messages, selectedConversation }) {

    const [noMoreMessages, setNoMoreMessages] = useState(false);
    const [scrollFromBottom, setScrollFromBottom] = useState(0);
    const [localMessages, setLocalMessages] = useState([]);
    const messagesCtrRef = useRef(null);
    const loadMoreIntersect = useRef(null);
    const [showAttachmentPreview, setShowAttachmentPreview] = useState(false);
    const [previewAttachment, setPreviewAttachment] = useState({});
    const { on } = userEventBus();

    const messageCreated = (message) => {
        if (selectedConversation && selectedConversation.group_id && selectedConversation.id === message.group_id) {
            setLocalMessages((prevMessage) => [...prevMessage, message]);
        }
        if (selectedConversation && selectedConversation.is_user && selectedConversation.id == message.sender_id || message.receiver_id) {
            setLocalMessages((prevMessage) => [...prevMessage, message]);
        }
    }

    const onAttachmentClick = (attachments, ind) => {
        setPreviewAttachment({ attachments, ind });
        setShowAttachmentPreview(true);
    }

    const loadMoreMessages = useCallback(() => {
        if (noMoreMessages) {
            return; // If there are no messages, return early to avoid errors
        }

        const firstMessage = localMessages[0];
        axios.get(route("message.loadOlder", firstMessage.id)).then(({ data }) => {
            if (data.data.length === 0) {
                setNoMoreMessages(true);
                return;
            }
            const scrollHeight = messagesCtrRef.current.scrollHeight;
            const scrollTop = messagesCtrRef.current.scrollHeight;
            const clientHeight = messagesCtrRef.current.clientHeight;
            const tmpScrollFromBottom = scrollHeight - scrollTop - clientHeight;
            setScrollFromBottom(tmpScrollFromBottom);

            setLocalMessages((prevMessages) => {
                return [...data.data.reverse(), ...prevMessages];
            });
        }).catch(error => {
            console.error('Error loading older messages:', error);
        });
    }, [localMessages, noMoreMessages]);

    useEffect(() => {
        setTimeout(() => {
            if (messagesCtrRef.current) {
                messagesCtrRef.current.scrollTop = messagesCtrRef.current.scrollHeight;
            }
        }, 10);

        const offCreated = on("message.created", messageCreated);
        setScrollFromBottom(0);
        setNoMoreMessages(false);
        return () => {
            offCreated();
        }

    }, [selectedConversation]);

    useEffect(() => {
        setLocalMessages(messages ? messages.data.reverse() : []);
    }, [messages]);

    useEffect(() => {
        if (messagesCtrRef.current && scrollFromBottom !== null) {
            messagesCtrRef.current.scrollTop = messagesCtrRef.current.scrollHeight - messagesCtrRef.current.offsetHeight - scrollFromBottom;
            if (noMoreMessages) return;
        }

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    loadMoreMessages();
                }
            });
        }, { rootMargin: "0px 0px 250px 0px" });

        if (loadMoreIntersect.current) {
            setTimeout(() => {
                observer.observe(loadMoreIntersect.current);
            }, 100);
        }

        return () => {
            observer.disconnect();
        };
    }, [localMessages]);

    return (
        <>
            {!messages && (
                <div className="flex flex-col gap-8 justify-center items-center text-center h-full opacity-35">
                    <div className="text-2xl md:text-4xl p-16 text-slate-200">
                        Please select conversation to see messages
                    </div>
                    <ChatBubbleLeftRightIcon className="w-32 h-32 inline-block" />
                </div>
            )}
            {
                messages && (
                    <>
                        <ConversationHeader selectedConversation={selectedConversation} />
                        <div className="flex-1 overflow-y-auto p-5" ref={messagesCtrRef}>
                            {localMessages.length === 0 && (
                                <div className='flex justify-center items-center h-full'>
                                    <div className='text-lg tet-slate-200'> No messages found</div>
                                </div>
                            )}
                            <div className="flex-1 flex flex-col">
                                <div ref={loadMoreIntersect}></div>
                                {localMessages.length > 0 && (
                                    localMessages.map((message) => (
                                        <MessageItem key={message.id} message={message} onAttachmentClick={onAttachmentClick} />
                                    ))
                                )}
                            </div>
                        </div>
                        <MessageInput conversation={selectedConversation} />
                    </>
                )
            }
            {previewAttachment.attachments && (
                <AttachmentPreviewModal attachments={previewAttachment.attachments} index={previewAttachment.ind} show={showAttachmentPreview} onClose={() => setShowAttachmentPreview(false)} />
            )}

        </>
    );
}

Home.layout = page => {
    return (
        <AuthenticatedLayout>
            <ChatLayout children={page} />
        </AuthenticatedLayout>
    )
}

export default Home;