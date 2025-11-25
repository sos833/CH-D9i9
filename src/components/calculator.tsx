
"use client";

import React, { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';

export const SimpleCalculator = () => {
  const [displayValue, setDisplayValue] = useState('0');
  const [operator, setOperator] = useState<string | null>(null);
  const [previousValue, setPreviousValue] = useState<number | null>(null);
  const [clearDisplay, setClearDisplay] = useState(false);

  const handleDigitClick = (digit: string) => {
    if (displayValue === '0' || clearDisplay) {
      setDisplayValue(digit);
      setClearDisplay(false);
    } else {
      setDisplayValue(displayValue + digit);
    }
  };

  const handleOperatorClick = (nextOperator: string) => {
    const inputValue = parseFloat(displayValue);

    if (operator && previousValue !== null && !clearDisplay) {
      const result = calculate();
      setDisplayValue(String(result));
      setPreviousValue(result);
    } else {
      setPreviousValue(inputValue);
    }
    
    setOperator(nextOperator);
    setClearDisplay(true);
  };
  
  const calculate = (): number => {
    const inputValue = parseFloat(displayValue);
    if (previousValue === null || operator === null) return inputValue;

    switch (operator) {
      case '+':
        return previousValue + inputValue;
      case '-':
        return previousValue - inputValue;
      case '*':
        return previousValue * inputValue;
      case '/':
        return previousValue / inputValue;
      default:
        return inputValue;
    }
  };

  const handleEqualsClick = () => {
    if (operator && previousValue !== null) {
      const result = calculate();
      setDisplayValue(String(result));
      setPreviousValue(result);
      setOperator(null);
      setClearDisplay(true); // Let user start a new calculation
    }
  };

  const handleClear = () => {
    setDisplayValue('0');
    setOperator(null);
    setPreviousValue(null);
    setClearDisplay(false);
  };
  
  const handleBackspace = () => {
    setDisplayValue(displayValue.slice(0, -1) || '0');
  }

  const handleDotClick = () => {
    if (!displayValue.includes('.')) {
      setDisplayValue(displayValue + '.');
    }
  };

  const handleSpecialZeroClick = (zeros: string) => {
    if (displayValue !== '0' && !clearDisplay) {
      setDisplayValue(displayValue + zeros);
    } else if (clearDisplay) {
       setDisplayValue(zeros);
       setClearDisplay(false);
    }
  };

  return (
    <div className="bg-card p-4 rounded-lg shadow-lg" dir="ltr">
      <Input
        type="text"
        readOnly
        value={displayValue}
        className="w-full h-20 text-5xl text-right font-mono bg-background text-foreground border-0 focus-visible:ring-0 focus-visible:ring-offset-0 mb-4"
      />
      <div className="grid grid-cols-4 gap-2 text-lg">
        <Button variant="secondary" className="col-span-2 text-xl" onClick={handleClear}>C</Button>
        <Button variant="secondary" className="text-xl" onClick={handleBackspace}>DEL</Button>
        <Button variant="destructive" className="bg-accent hover:bg-accent/90 text-accent-foreground text-xl" onClick={() => handleOperatorClick('/')}>÷</Button>
        
        <Button variant="outline" className="text-xl" onClick={() => handleDigitClick('7')}>7</Button>
        <Button variant="outline" className="text-xl" onClick={() => handleDigitClick('8')}>8</Button>
        <Button variant="outline" className="text-xl" onClick={() => handleDigitClick('9')}>9</Button>
        <Button variant="destructive" className="bg-accent hover:bg-accent/90 text-accent-foreground text-xl" onClick={() => handleOperatorClick('*')}>×</Button>

        <Button variant="outline" className="text-xl" onClick={() => handleDigitClick('4')}>4</Button>
        <Button variant="outline" className="text-xl" onClick={() => handleDigitClick('5')}>5</Button>
        <Button variant="outline" className="text-xl" onClick={() => handleDigitClick('6')}>6</Button>
        <Button variant="destructive" className="bg-accent hover:bg-accent/90 text-accent-foreground text-xl" onClick={() => handleOperatorClick('-')}>−</Button>

        <Button variant="outline" className="text-xl" onClick={() => handleDigitClick('1')}>1</Button>
        <Button variant="outline" className="text-xl" onClick={() => handleDigitClick('2')}>2</Button>
        <Button variant="outline" className="text-xl" onClick={() => handleDigitClick('3')}>3</Button>
        <Button variant="destructive" className="bg-accent hover:bg-accent/90 text-accent-foreground text-xl" onClick={() => handleOperatorClick('+')}>+</Button>

        <Button variant="outline" className="text-xl" onClick={() => handleDigitClick('0')}>0</Button>
        <Button variant="outline" className="text-xl" onClick={handleDotClick}>.</Button>
        <Button variant="default" className="col-span-2 text-xl" onClick={handleEqualsClick}>=</Button>
      </div>
       <div className="grid grid-cols-2 gap-2 mt-2">
        <Button variant="outline" className="text-xl" onClick={() => handleSpecialZeroClick('00')}>00</Button>
        <Button variant="outline" className="text-xl" onClick={() => handleSpecialZeroClick('000')}>000</Button>
      </div>
    </div>
  );
};
