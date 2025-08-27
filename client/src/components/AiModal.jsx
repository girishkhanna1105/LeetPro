import { useState } from 'react';
import { motion } from 'framer-motion';
import api from '../api';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Wand2 } from 'lucide-react';
import { toast } from 'sonner';

const AiModal = ({ onSuggestionGenerated }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleGenerate = async () => {
        setLoading(true);
        toast.info("Generating new AI suggestions...");
        try {
            await api.post('/user/ai-suggestion');
            toast.success("New suggestions have been saved to your dashboard.");
            onSuggestionGenerated(); // Callback to refresh dashboard data
            setIsOpen(false);
        } catch (error) {
            toast.error("Failed to generate AI feedback.", {
              description: error.response?.data?.message || "Please try again."
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <motion.div
                className="fixed bottom-8 right-8 z-50"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
            >
                <Button onClick={() => setIsOpen(true)} size="lg" className="rounded-full shadow-lg">
                    <Wand2 className="mr-2 h-5 w-5" /> Get AI Suggestion
                </Button>
            </motion.div>

            <Dialog open={isOpen} onOpenChange={setIsOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Generate New AI Suggestions?</DialogTitle>
                        <DialogDescription>
                            This will analyze your latest stats to create a new set of personalized feedback and problem recommendations. This will replace your current suggestions.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="ghost" onClick={() => setIsOpen(false)}>Cancel</Button>
                        <Button onClick={handleGenerate} disabled={loading}>
                            {loading ? "Analyzing..." : "Generate"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
};

export default AiModal;