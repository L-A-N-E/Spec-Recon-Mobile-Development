import { motion } from "framer-motion"

interface PageTransitionProps {
    children: React.ReactNode
}

function PageTransition({
    children
}: PageTransitionProps) {

    return (
        <motion.div
            initial={{
                opacity: 0,
                y: 10,
                filter: "blur(4px)"
            }}

            animate={{
                opacity: 1,
                y: 0,
                filter: "blur(0px)"
            }}

            exit={{
                opacity: 0,
                y: -10,
                filter: "blur(4px)"
            }}

            transition={{
                duration: 0.3,
                ease: "easeOut"
            }}
        >
            {children}
        </motion.div>
    )
}

export default PageTransition