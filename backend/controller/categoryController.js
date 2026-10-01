const Category = require("../model/categoryModel")

// Note: 500 responses only send a generic message. The real error is logged
// with console.error on the server, so database details never reach the browser.

const createCategory = async(req, res) => {
    try{
        const { title } = req.body;

        const newCategory = new Category({
            title,
            userId : req.userId,
            isDefault: false
        })

        const savedCategory = await newCategory.save()
        res.status(201).json(savedCategory)

    } catch (error) {
        console.error(error);
        res.status(500).json({
            message : "Couldn't create the category",
        })
    }
};

const getCategories = async(req, res) => {
    try{
        const categories = await Category.find({
            $or: [
                { isDefault: true },
                { userId: req.userId }
            ]
        })

        if(!categories) {
            return res.status(404).json({
                message : "No categories found"
            })
        }

        res.status(200).json({
            categories
        })

    } catch (error){
        console.error(error);
        res.status(500).json({
            message : "Couldn't get categories",
        })
    }
};

const getCategory = async(req, res) => {
    try {
        const { id } = req.params;

        const category = await Category.findOne({
            _id: id,
            $or: [
                { isDefault: true },
                { userId: req.userId }
            ]
        });

        if(!category) {
            return res.status(404).json({
                message : "No category"
            })
        }

        res.status(200).json({
            category
        })

    } catch (error) {
        console.error(error);
        res.status(500).json({
            message : "Could't load category",
        })
    }
};

const updateCategory = async (req, res) => {
    try {
        const { id } = req.params;

        const updatedCategory = await Category.findOneAndUpdate({
                _id: id,
                userId: req.userId,
                isDefault: false
            },
            {
                title: req.body.title
            },
            { new: true, runValidators: true }
        )

        if (!updatedCategory) {
            return res.status(404).json({
                message : "No category found"
            })
        }

        res.status(200).json(updatedCategory)

    } catch (error) {
        console.error(error);
        res.status(500).json({
            message : "Couldn't update category",
        })
    }
};

const deleteCategory = async(req, res) => {
    try {
        const { id } = req.params;

        const deletedCategory = await Category.findOneAndDelete({
            _id: id,
            userId: req.userId,
            isDefault: false
        });

        if(!deletedCategory) {
            return res.status(404).json({
                message : "Couldn't find category"
            })
        }

        res.status(200).json({
            "deletedCategory" : { deletedCategory }
        })

    } catch(error) {
        console.error(error);
        res.status(500).json({
            message : "Couldn't delete category",
        })
    }
}

module.exports = {
    createCategory,
    getCategories,
    getCategory,
    updateCategory,
    deleteCategory
}