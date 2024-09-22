'use client';

import {ReactNode, useCallback, useEffect, useRef, useState} from 'react';
import {motion} from 'framer-motion';
import {AiOutlineClose} from 'react-icons/ai';

const Drawer = ({children, open: openDefault = false, onClose, useCloseBtn = true}: Props) => {
  const [open, setOpen] = useState(openDefault);
  const drawerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setOpen(openDefault)
  }, [openDefault])

  const handleClick = useCallback((event: MouseEvent) => {
    if (drawerRef.current && !drawerRef.current.contains(event.target as Node)) onClose();
  }, [onClose]);

  useEffect(() => {
    if (open) document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [open, handleClick]);

  return (
    <>
      {open && <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm z-40"></div>}
      <div className="absolute t-0 l-0 z-50">
        <motion.div
          ref={drawerRef}
          initial={{x: '100%'}}
          animate={{x: open ? 0 : '100%'}}
          transition={{type: 'spring', stiffness: 200, damping: 30}}
          className="fixed top-0 right-0 h-full w-1/3 w-min-300 bg-gray-100 shadow-lg"
        >
          {
            useCloseBtn &&
            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-xl text-gray-600 hover:text-gray-800"
            >
              <AiOutlineClose/>
            </button>
          }
          <div>
            {children}
          </div>
        </motion.div>
      </div>
    </>
  );
};

type Props = {
  children: ReactNode;
  open?: boolean,
  onClose: () => void;
  useCloseBtn?: boolean
};

export default Drawer;
