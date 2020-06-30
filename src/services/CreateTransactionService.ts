import { getCustomRepository, getRepository } from 'typeorm';

import AppError from '../errors/AppError';

import Transaction from '../models/Transaction';
import Category from '../models/Category';
import TransactionsRepository from '../repositories/TransactionsRepository';

interface Request {
  title: string;
  value: number;
  type: 'income' | 'outcome';
  category: string;
}

class CreateTransactionService {
  public async execute({
    title,
    value,
    type,
    category,
  }: Request): Promise<Transaction> {
    const transactionsRepository = getCustomRepository(TransactionsRepository);
    const categoriesRepository = getRepository(Category);

    if (type !== 'income' && type !== 'outcome') {
      throw new AppError('Transactions can only be income or outcome');
    }

    const { total } = await transactionsRepository.getBalance();

    if (type === 'outcome' && total < value) {
      throw new AppError("You don't have enough balance");
    }

    let transactionCategory = await categoriesRepository.findOne({
      where: { title: category },
    });

    if (!transactionCategory) {
      transactionCategory = categoriesRepository.create({ title: category });
      await categoriesRepository.save(transactionCategory);
    }

    const transaction = transactionsRepository.create({
      title,
      value,
      type,
      category: transactionCategory,
    });

    await transactionsRepository.save(transaction);

    return transaction;
  }
}

export default CreateTransactionService;

// const categoriesRepository = getRepository(Category);

//   const findCategory = categoriesRepository.findOne(title);

//   if (type !== 'income' && type !== 'outcome') {
//     throw new AppError('Transaction types can only be income or outcome');
//   }

//   if (!findCategory) {
//     const newCategory = categoriesRepository.create({ title: category });
//     await categoriesRepository.save(newCategory);

//     const transaction = transactionsRepository.create({
//       title,
//       value,
//       type,
//       category_id: newCategory.id,
//     });

//     await transactionsRepository.save(transaction);

//     return transaction;
//   }

//   const transaction = transactionsRepository.create({
//     title,
//     value,
//     type,
//     category_id: findCategory.id,
//   });
