/**
 * VirtualList Component - Base virtualization component using TanStack Virtual
 * 
 * High-performance virtual scrolling for large datasets with Material-UI integration
 * and accessibility support.
 */

import React from 'react';
import PropTypes from 'prop-types';
import { useVirtualizer } from '@tanstack/react-virtual';
import MDBox from 'components/MDBox';

const VirtualList = ({
  items = [],
  renderItem,
  height = 400,
  estimateSize,
  overscan = 5,
  ...boxProps
}) => {
  const parentRef = React.useRef();
  
  const virtualizer = useVirtualizer({
    count: items.length,
    getScrollElement: () => parentRef.current,
    estimateSize: estimateSize || (() => 60),
    overscan,
  });

  const virtualItems = virtualizer.getVirtualItems();

  return (
    <MDBox
      ref={parentRef}
      sx={{
        height,
        overflow: 'auto',
        contain: 'strict',
      }}
      {...boxProps}
    >
      <MDBox
        sx={{
          height: virtualizer.getTotalSize(),
          width: '100%',
          position: 'relative',
        }}
      >
        {virtualItems.map((virtualItem) => (
          <MDBox
            key={virtualItem.key}
            data-index={virtualItem.index}
            sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: virtualItem.size,
              transform: `translateY(${virtualItem.start}px)`,
            }}
          >
            {renderItem({
              item: items[virtualItem.index],
              index: virtualItem.index,
              virtualItem,
            })}
          </MDBox>
        ))}
      </MDBox>
    </MDBox>
  );
};

VirtualList.propTypes = {
  items: PropTypes.array.isRequired,
  renderItem: PropTypes.func.isRequired,
  height: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  estimateSize: PropTypes.func,
  overscan: PropTypes.number,
};

export default VirtualList;