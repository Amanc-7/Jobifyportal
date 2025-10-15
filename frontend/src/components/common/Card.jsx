import React from 'react'
import { motion } from 'framer-motion'
import clsx from 'clsx'

const Card = ({
  children,
  hover = false,
  className = '',
  onClick,
  ...props
}) => {
  const cardClasses = clsx(
    hover ? 'card-hover' : 'card',
    onClick && 'cursor-pointer',
    className
  )

  const CardComponent = hover ? motion.div : 'div'

  const motionProps = hover ? {
    whileHover: { y: -2 },
    transition: { duration: 0.2 }
  } : {}

  return (
    <CardComponent
      className={cardClasses}
      onClick={onClick}
      {...motionProps}
      {...props}
    >
      {children}
    </CardComponent>
  )
}

export default Card
