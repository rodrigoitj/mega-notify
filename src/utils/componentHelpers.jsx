import React from 'react';
import { PropTypes } from 'prop-types';

const TextWithLimit = ({ text }) => {
  const style = {
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    width: 'auto', // You can adjust this to set the width limit
  };

  return (
    <div style={style} title={text} alt={text}>
      {text}
    </div>
  );
};
TextWithLimit.propTypes = {
  text: PropTypes.string.isRequired,
};
export { TextWithLimit };
