import React, { useState, useEffect, useRef } from 'react';
import toast from 'react-hot-toast';
import { Send, Loader2 } from 'lucide-react';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface PdfChatProps {
  pdfId: string;
  initialQuestion?: string;
}

const PdfChat: React.FC<PdfChatProps> = ({ pdfId, initialQuestion = '' }) => {
  const [question, setQuestion] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const hasSubmittedInitialQuestion = useRef(false);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (initialQuestion && !hasSubmittedInitialQuestion.current) {
      hasSubmittedInitialQuestion.current = true;
      setQuestion(initialQuestion);
      handleSubmit(initialQuestion);
    }
  }, [initialQuestion]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSubmit = async (submittedQuestion: string) => {
    const trimmedQuestion = submittedQuestion.trim();
    if (!trimmedQuestion) return;

    setIsLoading(true);
    setQuestion('');

    setMessages((prevMessages) => [
      ...prevMessages,
      { role: 'user', content: trimmedQuestion },
    ]);

    try {
      const response = await fetch(
        `http://localhost:4000/pdf/${
          pdfId === 'library' ? 'library-chat' : 'chat'
        }`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ question: trimmedQuestion, pdfId }),
        }
      );

      if (!response.ok || !response.body) {
        throw new Error(`API call failed: ${response.statusText}`);
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let assistantReply = '';

      setMessages((prevMessages) => [
        ...prevMessages,
        { role: 'assistant', content: '' },
      ]);

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value);
        assistantReply += chunk;

        setMessages((prevMessages) => {
          const newMessages = [...prevMessages];
          newMessages[newMessages.length - 1].content = assistantReply;
          return newMessages;
        });
      }
    } catch (error) {
      console.error('Error chatting with PDF:', error);
      toast.error(`An error occurred: ${error}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSubmit(question);
  };

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setQuestion(e.target.value);
    adjustTextareaHeight();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleFormSubmit(e);
    }
  };

  const adjustTextareaHeight = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  };

  return (
    <div className='flex flex-col h-full'>
      {/* Message Area */}
      <div className='flex-1 overflow-y-auto px-6 py-4 space-y-4 bg-gray-900'>
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`flex ${
              msg.role === 'user' ? 'justify-end' : 'justify-start'
            }`}
          >
            <div
              className={`p-4 rounded-lg max-w-xl ${
                msg.role === 'user'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-800 text-gray-200'
              }`}
            >
              <p className='whitespace-pre-wrap'>{msg.content}</p>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <form
        onSubmit={handleFormSubmit}
        className='px-6 py-4 flex bg-gray-900 items-center justify-center'
      >
        <div className='flex items-center w-full max-w-lg mx-auto bg-gray-800 rounded-full px-2'>
          <textarea
            ref={textareaRef}
            value={question}
            onChange={handleTextareaChange}
            onKeyDown={handleKeyDown}
            placeholder='Ask a question about the PDF...'
            className='flex-grow p-3 bg-transparent text-white resize-none overflow-hidden focus:outline-none ' // Changed to 'rounded-full' for fully rounded corners
            rows={1}
          />
          <button
            type='submit'
            disabled={isLoading || !question.trim()}
            className={`p-2 ${
              isLoading || !question.trim()
                ? 'bg-gray-600 cursor-not-allowed'
                : 'bg-blue-500 hover:bg-blue-600'
            } rounded-full m-2`}
          >
            {isLoading ? (
              <Loader2 className='w-6 h-6 animate-spin text-white' />
            ) : (
              <Send className='w-6 h-6 text-white' />
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default PdfChat;
