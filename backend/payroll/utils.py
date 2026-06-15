from decimal import Decimal


def calculate_cnss(gross_salary):
    rate = Decimal('0.05')
    employee_cnss = (gross_salary * rate).quantize(Decimal('0.01'))
    employer_cnss = (gross_salary * rate).quantize(Decimal('0.01'))
    return employee_cnss, employer_cnss


def calculate_ipr(gross_salary):
    if gross_salary <= Decimal('100000'):
        return Decimal('0')
    elif gross_salary <= Decimal('500000'):
        return (gross_salary * Decimal('0.10')).quantize(Decimal('0.01'))
    elif gross_salary <= Decimal('1000000'):
        return (gross_salary * Decimal('0.15')).quantize(Decimal('0.01'))
    elif gross_salary <= Decimal('2000000'):
        return (gross_salary * Decimal('0.20')).quantize(Decimal('0.01'))
    else:
        return (gross_salary * Decimal('0.25')).quantize(Decimal('0.01'))


def calculate_net_salary(gross_salary, bonuses=Decimal('0'), deductions=Decimal('0')):
    if not isinstance(gross_salary, Decimal):
        gross_salary = Decimal(str(gross_salary))
    if not isinstance(bonuses, Decimal):
        bonuses = Decimal(str(bonuses))
    if not isinstance(deductions, Decimal):
        deductions = Decimal(str(deductions))

    cnss_employee, cnss_employer = calculate_cnss(gross_salary)
    taxes = calculate_ipr(gross_salary)
    net_salary = gross_salary + bonuses - deductions - cnss_employee - taxes

    return {
        'gross_salary': gross_salary,
        'cnss_employee': cnss_employee,
        'cnss_employer': cnss_employer,
        'taxes': taxes,
        'bonuses': bonuses,
        'deductions': deductions,
        'net_salary': net_salary.quantize(Decimal('0.01')),
    }
