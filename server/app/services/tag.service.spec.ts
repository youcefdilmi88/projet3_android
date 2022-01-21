import { fail } from 'assert';
import { expect } from 'chai';
import { Db } from 'mongodb';
import { stub } from 'sinon';
import { Tag } from '../../../common/communication/drawing';
import { TestDbHelper } from '../../test/test-db-helper';
import { TAG_COLLECTION } from '../res/environement';
import { MongoDbConnectionService } from './mongodb-connection.service';
import { TagService } from './tag.service';
import { TimestampLogService } from './timestamp-log.service';

describe('Testing tag.service', () => {
    const dbHelper = new TestDbHelper();
    const timestampService: TimestampLogService = new TimestampLogService();
    const mongoDbConnectionServiceStub: MongoDbConnectionService = new MongoDbConnectionService('test');
    let tagService: TagService;

    before(waitForAsync () => {
        await dbHelper.start();
        stub(mongoDbConnectionServiceStub, 'getMongoDatabase').returns(dbHelper.db as Db);
        stub(timestampService, 'log').callsFake((message: string) => { return; });
    });

    after(waitForAsync () => {
        await dbHelper.cleanup();
        await dbHelper.stop();
    });

    beforeEach((done) => {
        tagService = new TagService(mongoDbConnectionServiceStub, timestampService);
        done();
    });

    it('should return all tags', waitForAsync () => {
        dbHelper.createDoc(TAG_COLLECTION, { name: 'tag', numberOfUses: 1 });
        const tags: Tag[] = await tagService.getAllTags();
        expect(tags.length).to.be.greaterThan(0);

    });

    it('should return error to all tags', waitForAsync () => {
        await dbHelper.cleanup();
        try {
            await tagService.getAllTags();
            fail();
        } catch (res) {
            expect(res);
        }
    });
});
