// import AppError from '../errors/AppError';

import { getRepository, getCustomRepository } from 'typeorm';
import Transaction from '../models/Transaction';
import Category from '../models/Category';
import TransactionsRepository from '../repositories/TransactionsRepository';
import AppError from '../errors/AppError';

interface Request {
  title: string;
  type: 'income' | 'outcome';
  value: number;
  category: string;
}
class CreateTransactionService {
  public async execute({
    title,
    type,
    value,
    category: categoryTitle,
  }: Request): Promise<Transaction> {
    const transactionsRepository = getCustomRepository(TransactionsRepository);
    const categoriesRepository = getRepository(Category);

    if (type === 'outcome') {
      const balance = await transactionsRepository.getBalance();
      if (balance.total < value) {
        throw new AppError('Insufficient balance for this outcome transaction');
      }
    }

    const categoryExists = await categoriesRepository.findOne({
      where: { title: categoryTitle },
    });
    let category_id = null;

    if (categoryExists) {
      category_id = categoryExists.id;
    } else {
      const category = categoriesRepository.create({ title: categoryTitle });
      await categoriesRepository.save(category);
      category_id = category.id;
    }

    const transaction = transactionsRepository.create({
      title,
      type,
      value,
      category_id,
    });
    await transactionsRepository.save(transaction);
    return transaction;
  }
}

export default CreateTransactionService;
