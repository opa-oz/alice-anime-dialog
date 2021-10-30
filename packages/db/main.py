import argparse
import sys
import logging
from subcommands import migrate_all, migrate_animes, migrate_genres, migrate_collections
from utils import str2bool


def choose_migration(args):
    target = args.target
    dry_run = args.dry_run

    if target == 'all':
        func = migrate_all
    elif target == 'animes':
        func = migrate_animes
    elif target == 'genres':
        func = migrate_genres
    elif target == 'collections':
        func = migrate_collections
    else:
        return None

    func(dry_run)


def main(arguments):
    # @see {@link https://docs.python.org/3/library/argparse.html#sub-commands}
    parser = argparse.ArgumentParser(description='Scripts for database')
    parser.add_argument('-v', '--verbose', type=str2bool, nargs='?', const=True, default=False,
                        help='Set loglevel to DEBUG')

    subparsers = parser.add_subparsers(help='sub-command help')

    parser_migrate = subparsers.add_parser('migrate', description='Setup tables in PG')
    parser_migrate.add_argument('-t', '--target', choices=['all', 'animes', 'genres', 'collections'],
                                help='Target table to migrate')
    parser_migrate.add_argument('--dry-run', type=str2bool, nargs='?', const=True, default=False,
                                help='Run without actual running')
    parser_migrate.set_defaults(func=choose_migration)

    args, unknown = parser.parse_known_args(arguments[1:])
    if args.verbose:
        logging.basicConfig(level=logging.DEBUG)

    args.func(args)
    print(args, unknown)


if __name__ == '__main__':
    main(sys.argv)
