import React from 'react';
import { Button, Flex, Avatar, Typography } from 'antd';
import { useUsers } from '../useUsers.jsx';

const { Text } = Typography;

const ProjectActionButton = ({
  type = 'default',
  icon,
  text,
  danger = false,
  showMembers = false,
  members = [],
  maxMembersToShow = 4,
  onClick
}) => {
    
const { UserAvatar } = useUsers();

  const renderIcon = () => {
    return React.cloneElement(icon, { style: { fontSize: '20px' } });
  };

  return (
    <Button 
      type={type}
      danger={danger}
      style={{
        height: 'auto',
        padding: '8px 12px',
        border: '0',
        borderRadius: '12px'
      }}
      onClick={onClick}
    >
      <Flex justify="space-between" vertical gap="6px">
        <Flex gap="8px" align="center" style={{height: '30px'}}>
          {renderIcon()}
          
          {showMembers && (
            members?.length > 0 ? (
              <Avatar.Group 
                max={{
                  count: maxMembersToShow,
                  style: { 
                    color: '#190BFF', 
                    backgroundColor: '#CCC2FF' 
                  },
                  popover: { visible: false }
                }}
              >
                {members.map(member => (
                  <UserAvatar 
                    name={member.name}
                    id={member.id}
                  >
                    {member.name?.charAt(0)?.toUpperCase()}
                  </UserAvatar>
                ))}
              </Avatar.Group>
            ) : (
              <Text type="secondary">Нет участников</Text>
            )
          )}
        </Flex>
        <p>{text}</p>
      </Flex>
    </Button>
  );
};

export default ProjectActionButton;