
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
      setClearDisplay(true);
    }
  };

  const handleClear = () => {
    setDisplayValue('0');
    setOperator(null);
    setPreviousValue(null);
    setClearDisplay(false);
  };

  const handleDotClick = () => {
    if (!displayValue.includes('.')) {
      setDisplayValue(displayValue + '.');
    }
  };

  const handleSpecialZeroClick = (zeros: string) => {
    if (displayValue !== '0' && !clearDisplay) {
      setDisplayValue(displayValue + zeros);
    }
  };

  return (
    <div className="bg-card p-4 rounded-lg shadow-lg" dir="ltr">
      <Input
        type="text"
        readOnly
        value={displayValue}
        className="w-full h-16 text-4xl text-right font-mono bg-muted mb-4"
      />
      <div className="grid grid-cols-4 gap-2">
        <Button variant="outline" className="col-span-2" onClick={handleClear}>C</Button>
        <Button variant="outline" onClick={() => setDisplayValue(displayValue.slice(0, -1) || '0')}>DEL</Button>
        <Button variant="secondary" onClick={() => handleOperatorClick('/')}>÷</Button>
        
        <Button variant="outline" onClick={() => handleDigitClick('7')}>7</Button>
        <Button variant="outline" onClick={() => handleDigitClick('8')}>8</Button>
        <Button variant="outline" onClick={() => handleDigitClick('9')}>9</Button>
        <Button variant="secondary" onClick={() => handleOperatorClick('*')}>×</Button>

        <Button variant="outline" onClick={() => handleDigitClick('4')}>4</Button>
        <Button variant="outline" onClick={() => handleDigitClick('5')}>5</Button>
        <Button variant="outline" onClick={() => handleDigitClick('6')}>6</Button>
        <Button variant="secondary" onClick={() => handleOperatorClick('-')}>−</Button>

        <Button variant="outline" onClick={() => handleDigitClick('1')}>1</Button>
        <Button variant="outline" onClick={() => handleDigitClick('2')}>2</Button>
        <Button variant="outline" onClick={() => handleDigitClick('3')}>3</Button>
        <Button variant="secondary" onClick={() => handleOperatorClick('+')}>+</Button>

        <Button variant="outline" onClick={() => handleDigitClick('0')}>0</Button>
        <Button variant="outline" onClick={handleDotClick}>.</Button>
        <Button variant="default" className="col-span-2" onClick={handleEqualsClick}>=</Button>
      </div>
       <div className="grid grid-cols-2 gap-2 mt-2">
        <Button variant="outline" onClick={() => handleSpecialZeroClick('00')}>00</Button>
        <Button variant="outline" onClick={() => handleSpecialZeroClick('000')}>000</Button>
      </div>
    </div>
  );
};
