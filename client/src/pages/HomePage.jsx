import React from "react";
import { Link } from "react-router-dom";
import { Button } from "../components/button";
import { Card, CardContent } from "../components/card";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-300 to-blue-300 text-white flex flex-col justify-center items-center p-4">
      <motion.h1
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-5xl font-bold mb-4 text-center text-shadow-lg"
      >
        Invoice Management System
      </motion.h1>

      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="text-lg mb-8 text-center max-w-xl"
      >
        Streamline your invoicing process with ease. Track, manage, and send invoices all in one place.
      </motion.p>

      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, delay: 0.4 }}
      >
        <Card className="bg-white text-black shadow-xl rounded-2xl p-6">
          <CardContent className="flex flex-col items-center">
            <p className="text-xl font-semibold mb-4 text-center">
              Ready to manage your invoices?
            </p>
            <Link to="/login">
              <Button className="flex items-center bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 text-lg rounded-xl">
                Get Started <ArrowRight className="ml-2" />
              </Button>
            </Link>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
