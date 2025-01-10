import crypto from 'crypto';
import { Op } from 'sequelize';
import { getVerificationEmailTemplate } from '../emails/emailTemplate.js';
import Game from '../models/games.js';
import User from '../models/users.js';
import { sendEmail } from '../utils/sendEmail.js';

async function generateID(id) {
  const { count } = await findAndCountAllUsersById(id);
  if (count > 0) {
    id = id.substring(0, 5);
    const { count } = await findAndCountAllUsersById(id);
    id = id + (count + 1);
  }
  return id;
}

export async function getUsers() {
  return await User.findAll();
}
export async function getUserById(id) {
  return await User.findByPk(id);
}
export async function findAndCountAllUsersById(id) {
  return await User.findAndCountAll({
    where: {
      id: {
        [Op.like]: `${id}%`,
      },
    },
  });
}
export async function findAndCountAllUsersByEmail(email) {
  return await User.findAndCountAll({
    where: {
      email: {
        [Op.eq]: email,
      },
    },
  });
}
export async function findAndCountAllUsersByUsername(username) {
  return await User.findAndCountAll({
    where: {
      username: {
        [Op.eq]: username,
      },
    },
  });
}
export async function registerUser(userDatas, bcrypt) {
  if (!userDatas) {
    return { error: 'Aucune donnée à enregistrer' };
  }
  const { firstname, lastname, username, email, password } = userDatas;
  if (!firstname || !lastname || !username || !email || !password) {
    return { error: 'Tous les champs sont obligatoires' };
  }
  //vérification que l'email n'est pas déjà utilisé
  const { count: emailCount } = await findAndCountAllUsersByEmail(email);
  if (emailCount > 0) {
    return { error: "L'adresse email est déjà utilisée." };
  }

  //vérification que le pseudo n'est pas déjà utilisé
  const { count: usernameCount } = await findAndCountAllUsersByUsername(username);
  if (usernameCount > 0) {
    return { error: "Le nom d'utilisateur est déjà utilisé." };
  }
  //création de l'identifiant
  let id = await generateID((lastname.substring(0, 3) + firstname.substring(0, 3)).toUpperCase());
  //hashage du mot de passe
  const hashedPassword = await bcrypt.hash(password);
  //création de l'utilisateur dans la base de données
  const user = {
    id,
    firstname,
    lastname,
    username,
    email,
    password: hashedPassword,
  };

  // Generate a verification token
  const verificationToken = crypto.randomBytes(20).toString('hex');

  // Add the verification token to the user object
  user.verificationToken = verificationToken;

  // Save the user to the database
  const savedUser = await User.create(user);

  // Generate the verification link
  const verificationLink = `http://${process.env.APP_URL}/verify-email/${verificationToken}`;

  // Generate the email HTML
  const emailHtml = getVerificationEmailTemplate(verificationLink);

  // Send the verification email
  await sendEmail(email, 'Verify Your Email', emailHtml);

  return { message: 'User registered. Please check your email to verify your account.' };
}
export async function loginUser(userDatas, app) {
  if (!userDatas) {
    return { error: "Aucune donnée n'a été envoyée" };
  }
  const { email, password } = userDatas;
  if (!email || !password) {
    return { error: 'Tous les champs sont obligatoires' };
  }
  //vérification que l'email est utilisé
  const { count, rows } = await findAndCountAllUsersByEmail(email);
  if (count === 0) {
    return {
      error: "Il n'y a pas d'utilisateur associé à cette adresse email.",
    };
  } else if (rows[0].verified === false) {
    return {
      error: "Votre compte n'est pas encore vérifié. Veuillez vérifier votre boîte mail.",
    };
  }
  //récupération de l'utilisateur
  const user = await User.findOne({
    where: {
      email: {
        [Op.eq]: email,
      },
    },
  });
  //comparaison des mots de passe
  const match = await app.bcrypt.compare(password, user.password);
  if (!match) {
    return { error: 'Mot de passe incorrect' };
  }
  // Générer le JWT après une authentification réussie
  const token = app.jwt.sign({ id: user.id, username: user.username }, { expiresIn: '3h' });
  return { token };
}

export async function verifyEmail(token) {
  const user = await User.findOne({ where: { verificationToken: token } });

  if (!user) {
    return { error: 'Invalid verification token' };
  }

  user.verified = true;
  user.verificationToken = null;
  await user.save();

  return { message: 'Email verified successfully. You can now log in.' };
}

export async function getUserStats(userId) {
  try {
    // Get all games where the user was either player1 or player2
    const games = await Game.findAll({
      where: {
        [Op.or]: [
          { creator: userId }, // player1
          { player: userId }, // player2
        ],
        state: 'finished', // Only count completed games
      },
    });

    // Calculate statistics
    const totalGames = games.length;
    const wins = games.filter((game) => game.winner === userId).length;

    // Calculate total score
    const totalScore = games.reduce((score, game) => {
      // If user is the winner, add winnerScore
      if (game.winner === userId && game.winnerScore) {
        return score + game.winnerScore;
      }
      // If it's a draw (winnerScore exists but no winner)
      else if (!game.winner && game.winnerScore) {
        return score + 1; // Add 1 point for draws
      }
      return score;
    }, 0);

    // Calculate win rate
    const winRate = totalGames > 0 ? ((wins / totalGames) * 100).toFixed(1) : 0;

    // Calculate recent games (last 5 games)
    const recentGames = await Game.findAll({
      where: {
        [Op.or]: [{ creator: userId }, { player: userId }],
        state: 'finished',
      },
      order: [['updatedAt', 'DESC']],
      limit: 5,
      include: [
        { model: User, as: 'player1', attributes: ['username'] },
        { model: User, as: 'player2', attributes: ['username'] },
        { model: User, as: 'winPlayer', attributes: ['username'] },
      ],
    });

    return {
      totalGames,
      wins,
      losses: totalGames - wins,
      winRate: `${winRate}%`,
      totalScore,
      recentGames: recentGames.map((game) => ({
        id: game.id,
        opponent: game.creator === userId ? game.player2?.username : game.player1?.username,
        winner: game.winPlayer?.username || 'Draw',
        score: game.winnerScore,
        date: game.updatedAt,
      })),
    };
  } catch (error) {
    console.error('Error getting user stats:', error);
    return { error: 'Failed to get user statistics' };
  }
}
