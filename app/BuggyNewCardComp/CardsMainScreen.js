import React, { useEffect, useState } from 'react';
import CheckboxCard from './CheckboxCard';
import TextCard from './TextCard';
import NumberCard from './TextCard';  // Ensure correct import
import DropdownCard from './DropdownCard';
import FileCard from './FileCard';
import DocumentCard from './DocumentCard';

import { usePermissions } from '../GlobalVariables/PermissionsContext';

const CardRenderer = ({ item,as, onUpdateSuccess,wo,restricted }) => {
  const [isEditable, setIsEditable] = useState(false);
  const { instructionPermissions } = usePermissions();
  useEffect(() => {
    if (instructionPermissions.some((permission) => !restricted && permission.includes('U')) && wo.Status !=="COMPLETED" ){
      setIsEditable(true);
    }
  }, [instructionPermissions]);

  const renderCard = () => {
    switch (item.type) {
      case 'checkbox':
        return <CheckboxCard item={item} as={as} wo={wo} onUpdate={onUpdateSuccess} editable={isEditable} />;
      case 'text':
        return <TextCard item={item} as={as} wo={wo} onUpdate={onUpdateSuccess} editable={isEditable} />;
      case 'number':
        return <NumberCard item={item} as={as} wo={wo} onUpdate={onUpdateSuccess} type={"number"} editable={isEditable} />;
      case 'dropdown':
        return <DropdownCard item={item} as={as} wo={wo} onUpdate={onUpdateSuccess} editable={isEditable} />;
      case 'file':
        return <FileCard item={item} wo={wo} as={as} onUpdate={onUpdateSuccess} editable={isEditable} />;
      case 'document':
        return <DocumentCard item={item} wo={wo} as={as} onUpdate={onUpdateSuccess} editable={isEditable} />;
      default:
        return <Text>Unsupported card type: {item.type}</Text>;
    }
  };

  return <>{renderCard()}</>;
};

export default CardRenderer;
