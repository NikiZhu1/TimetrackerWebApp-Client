import React, { act, useEffect, useState } from 'react';
import { Button, message, Form, Input, Select, Modal, Flex, Typography, Tag, Divider } from 'antd';
import Icon, { PlusOutlined, StarFilled, UserDeleteOutlined } from '@ant-design/icons';
import '@ant-design/v5-patch-for-react-19';
import { useNavigate, useParams } from 'react-router-dom';

//Методы
import { useProjects } from '../useProjects.jsx';
import { GetJWT, GetUserIdFromJWT } from '../methods/UsersMethods.jsx';
import { useUsers } from '../useUsers.jsx';
import { emit } from '../event.jsx';

// export const oldshowMembersModal = ( isAdmin, members, projectId ) => {
//   Modal.info({
//     title: 'Участники',
//     icon: null,
//     content: <Members isAdmin={isAdmin} members={members} projectId={projectId} />,
//     centered: true,
//     closable: true,
//     maskClosable: true,
//     onOk() {},
//     okText: 'Готово'
//   });
// };

export function MembersModal({ isOpen, onClose, isAdmin, members, projectId }) {
  const [membersArray, setMembers] = useState(members);

  const handleUserDeleted = (userId) => {
    setMembers(prev => prev.filter(m => m.id !== userId));
  };

  return (
    <Modal
      title="Участники"
      open={isOpen}
      footer={[
          <Button key="back" type="primary" onClick={onClose}>
            Готово
          </Button>
      ]}
      onCancel={onClose}
      centered={true}
      closable={true}
      maskClosable={true}
      okText="Готово"
    >
      <Flex vertical style={{maxHeight: '400px', overflowY: 'auto'}}>
        <Flex vertical>
          {membersArray.filter(member => member.isCreator === true).map(member => (
              <div key={`memInf${member.id}`}>
                <MemberInfo 
                    projectId={projectId}
                    userId={member.id}
                    userName={member.name}
                    isCreator={member.isCreator}
                    isAdmin={isAdmin}
                    onDelete={handleUserDeleted}/>
                <Divider style={{marginTop: '2px', marginBottom: '2px'}}/>
              </div>
          ))}
        </Flex>
        <Flex vertical>
          {membersArray.filter(member => member.isCreator === false).map(member => (
            <div key={`memInf${member.id}`}>
              <MemberInfo 
                  projectId={projectId}
                  userId={member.id}
                  userName={member.name}
                  isCreator={member.isCreator}
                  isAdmin={isAdmin}
                  onDelete={handleUserDeleted}/>
              <Divider style={{marginTop: '2px', marginBottom: '2px'}}/>
            </div>  
          ))}
        </Flex>
      </Flex>
    </Modal>
  );
}

function MemberInfo({
  projectId,
  userId,
  userName,
  isCreator = false,
  isAdmin = false,
  onDelete
}) {

  const { UserAvatar } = useUsers();
  const { deleteUserFromProject } = useProjects();

  //Удаление участника
  const deleteUser = async (userIdToDelete) => {
    const token = GetJWT();
    const userId = GetUserIdFromJWT(token);
  
    if (!token || !userId) {
        if (!token) message.warning('Нет доступа');
        if (!userId) Cookies.remove('token');
        Modal.destroyAll();
        return;
    }
  
    await deleteUserFromProject(token, projectId, userIdToDelete);
    emit('activityChanged');
    onDelete?.(userId);
  }
  
  //Роль
  const role = isCreator ? 'Создатель' : 'Участник';

  return (
      <Flex justify='space-between' align='center'>
        <Flex align='center' gap='8px'>
          <UserAvatar name={userName} id={userId} size={36} fontSize='18px'/>
          <Flex vertical>
            <p style={{fontSize: '16px'}}>@{userName}</p>
            {role}
          </Flex>
        </Flex>
        
        {isAdmin && !isCreator &&
        <Button
          color="default"
          type="text"
          danger
          onClick={() => deleteUser(userId)}
          icon={<UserDeleteOutlined style={{
              fontSize: '16px',
          }} />}> Удалить
        </Button>}

        {isCreator && <StarFilled style={{
          fontSize: '20px',
          color: '#F6DD4E',
          paddingRight: '12px'
        }} />}
      </Flex>
  );
}

// function Members({
//   isAdmin,
//   members,
//   projectId
// }) {

//   const [membersArray, setMembers] = useState(members);

//   const handleUserDeleted = (userId) => {
//     setMembers(prev => prev.filter(m => m.id !== userId));
//   };

//   return (
//       <Flex vertical style={{maxHeight: '400px', overflowY: 'auto', marginRight: '-12px'}}>
//         <Flex vertical>
//           {membersArray.filter(member => member.isCreator === true).map(member => (
//               <div key={`memInf${member.id}`}>
//                 <MemberInfo 
//                     projectId={projectId}
//                     userId={member.id}
//                     userName={member.name}
//                     isCreator={member.isCreator}
//                     isAdmin={isAdmin}
//                     onDelete={handleUserDeleted}/>
//                 <Divider style={{marginTop: '2px', marginBottom: '2px'}}/>
//               </div>
//           ))}
//         </Flex>
//         <Flex vertical>
//           {membersArray.filter(member => member.isCreator === false).map(member => (
//             <div key={`memInf${member.id}`}>
//               <MemberInfo 
//                   projectId={projectId}
//                   userId={member.id}
//                   userName={member.name}
//                   isCreator={member.isCreator}
//                   isAdmin={isAdmin}
//                   onDelete={handleUserDeleted}/>
//               <Divider style={{marginTop: '2px', marginBottom: '2px'}}/>
//             </div>  
//           ))}
//         </Flex>
//         {/* {[1, 2, 3, 4, 5, 6].map(id => (
//           <div key={`memInf${id}`}>
//             <MemberInfo userId={id} userName="FF" isCreator={false} isAdmin={true} />
//             <Divider style={{ margin: '2px 0' }} />
//           </div>
//         ))} */}

//       </Flex>
//   );
// }

