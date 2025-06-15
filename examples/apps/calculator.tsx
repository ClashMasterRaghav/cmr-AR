import React, { useState } from 'react';

interface CalculatorState {
    display: string;
    previousValue: number | null;
    operation: string | null;
    waitingForOperand: boolean;
}

const Calculator: React.FC = () => {
    const [state, setState] = useState<CalculatorState>({
        display: '0',
        previousValue: null,
        operation: null,
        waitingForOperand: false
    });

    const clearDisplay = (): void => {
        setState({
            display: '0',
            previousValue: null,
            operation: null,
            waitingForOperand: false
        });
    };

    const inputDigit = (digit: string): void => {
        const { display, waitingForOperand } = state;

        if (waitingForOperand) {
            setState({
                ...state,
                display: digit,
                waitingForOperand: false
            });
        } else {
            setState({
                ...state,
                display: display === '0' ? digit : display + digit
            });
        }
    };

    const inputDecimal = (): void => {
        const { display, waitingForOperand } = state;

        if (waitingForOperand) {
            setState({
                ...state,
                display: '0.',
                waitingForOperand: false
            });
        } else if (display.indexOf('.') === -1) {
            setState({
                ...state,
                display: display + '.'
            });
        }
    };

    const performOperation = (nextOperation: string): void => {
        const { display, previousValue, operation } = state;
        const inputValue = parseFloat(display);

        if (previousValue === null) {
            setState({
                ...state,
                previousValue: inputValue,
                operation: nextOperation,
                waitingForOperand: true
            });
        } else if (operation) {
            const currentValue = previousValue || 0;
            const newValue = calculate(currentValue, inputValue, operation);

            setState({
                display: String(newValue),
                previousValue: newValue,
                operation: nextOperation,
                waitingForOperand: true
            });
        }
    };

    const calculate = (firstValue: number, secondValue: number, operation: string): number => {
        switch (operation) {
            case '+': return firstValue + secondValue;
            case '-': return firstValue - secondValue;
            case '×': return firstValue * secondValue;
            case '÷': return firstValue / secondValue;
            case '%': return firstValue % secondValue;
            default: return secondValue;
        }
    };

    const handleEquals = (): void => {
        const { display, previousValue, operation } = state;
        const inputValue = parseFloat(display);

        if (previousValue !== null && operation) {
            const newValue = calculate(previousValue, inputValue, operation);
            setState({
                display: String(newValue),
                previousValue: null,
                operation: null,
                waitingForOperand: true
            });
        }
    };

    const handlePlusMinus = (): void => {
        const { display } = state;
        setState({
            ...state,
            display: display.charAt(0) === '-' ? display.substr(1) : '-' + display
        });
    };

    const handlePercent = (): void => {
        const { display } = state;
        const value = parseFloat(display);
        setState({
            ...state,
            display: String(value / 100)
        });
    };

    const Button: React.FC<{ onClick: () => void; className?: string; children: React.ReactNode }> = ({ 
        onClick, 
        className = '', 
        children 
    }) => (
        <button 
            className={`calc-btn ${className}`} 
            onClick={onClick}
        >
            {children}
        </button>
    );

    return (
        <div className="calculator">
            <div className="calculator-display">
                <div className="calculator-display-value">{state.display}</div>
            </div>
            <div className="calculator-keypad">
                <div className="calculator-input-keys">
                    <div className="calculator-function-keys">
                        <Button onClick={clearDisplay} className="calculator-key-clear">
                            AC
                        </Button>
                        <Button onClick={handlePlusMinus} className="calculator-key-sign">
                            ±
                        </Button>
                        <Button onClick={handlePercent} className="calculator-key-percent">
                            %
                        </Button>
                    </div>
                    <div className="calculator-digit-keys">
                        <Button onClick={() => inputDigit('7')} className="calculator-key-0">7</Button>
                        <Button onClick={() => inputDigit('8')} className="calculator-key-1">8</Button>
                        <Button onClick={() => inputDigit('9')} className="calculator-key-2">9</Button>
                        <Button onClick={() => inputDigit('4')} className="calculator-key-3">4</Button>
                        <Button onClick={() => inputDigit('5')} className="calculator-key-4">5</Button>
                        <Button onClick={() => inputDigit('6')} className="calculator-key-5">6</Button>
                        <Button onClick={() => inputDigit('1')} className="calculator-key-6">1</Button>
                        <Button onClick={() => inputDigit('2')} className="calculator-key-7">2</Button>
                        <Button onClick={() => inputDigit('3')} className="calculator-key-8">3</Button>
                        <Button onClick={() => inputDigit('0')} className="calculator-key-9">0</Button>
                        <Button onClick={inputDecimal} className="calculator-key-dot">.</Button>
                    </div>
                </div>
                <div className="calculator-operator-keys">
                    <Button onClick={() => performOperation('÷')} className="calculator-key-operator">÷</Button>
                    <Button onClick={() => performOperation('×')} className="calculator-key-operator">×</Button>
                    <Button onClick={() => performOperation('-')} className="calculator-key-operator">−</Button>
                    <Button onClick={() => performOperation('+')} className="calculator-key-operator">+</Button>
                    <Button onClick={handleEquals} className="calculator-key-equals">=</Button>
                </div>
            </div>
        </div>
    );
};

export default Calculator; 