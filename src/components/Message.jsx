import { Avatar, HStack, Text } from "@chakra-ui/react";

const Message = ({text,uri, user="other"}) => {
  return (
    <HStack
      alignSelf={user==="me"?"flex-end":"flex-start"}
      bg={"gray.300"}
      paddingX={"4"}
      paddingY={"2"}
      borderRadius={"base"}>

      {user==="other" && <Avatar src={uri} />} 

      <Text>{text}</Text>

      {user==="me" && <Avatar src={uri} />}
    </HStack>
  );
};

export default Message;
