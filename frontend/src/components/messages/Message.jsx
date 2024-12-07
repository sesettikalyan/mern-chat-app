import { useEffect } from "react";
import { useAuthContext } from "../../context/AuthContext";
import { extractTime } from "../../utils/extractTime";
import useConversation from "../../zustand/useConversation";

const Message = ({ message }) => {
	const { authUser } = useAuthContext();
	const { selectedConversation } = useConversation();
	const fromMe = message.senderId === authUser._id;
	const formattedTime = extractTime(message.createdAt);
	const chatClassName = fromMe ? "chat-end" : "chat-start";
	const profilePic = fromMe ? authUser.profilePic : selectedConversation?.profilePic;
	const bubbleBgColor = fromMe ? "bg-blue-500" : "";

	const shakeClass = message.shouldShake ? "shake" : "";

	useEffect(() => {
		// calling an update function to make the message to be viewed in the database
		const updateMessage = async () => {
			try {
				const response = await fetch(`/api/messages/${message._id}`, {
					method: "POST",
					headers: {
						"Content-Type": "application/json",
					},
				});
				const data = await response.json();
				console.log("updateMessage data", data);
			} catch (error) {
				console.error("Error in updateMessage:", error);
			}
		};
		updateMessage();
	}, []);

	return (
		<div className={`chat ${chatClassName}`}>
			<div className='chat-image avatar'>
				<div className='w-10 rounded-full'>
					<img alt='Tailwind CSS chat bubble component' src={profilePic} />
				</div>
			</div>
			<div className={`chat-bubble text-white ${bubbleBgColor} ${shakeClass} pb-2`}>{message.message}</div>
			<div className='chat-footer opacity-50 text-xs flex gap-1 items-center'>{formattedTime} </div>
		</div>
	);
};
export default Message;
