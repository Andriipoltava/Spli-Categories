<?php
/**
 * @package Split Categories
 * @version 0.01.06
 */

/**
 * Plugin Name: Split Categories
 * Plugin URI: https://webhelpagency.com/
 * Description: A plugin that is designed for a robotic category for several categories of carriers of all data that was there
 * Author: Andrii Omelianenko
 * Version: 0.01
 * Author URI: https://github.com/Andriipoltava/
 **/
define('SC_JS', plugin_dir_url(__FILE__) . 'app/');

final class splitCategories
{
    private static $instance = null;

    public static function instance()
    {
        if (is_null(self::$instance)) {
            self::$instance = new self();
        }

        return self::$instance;
    }

    public function __construct()
    {
        add_action('init', array($this, 'create_taxonomy'));
        add_action('admin_menu', array($this, 'init'));
        add_action('wp_ajax_processAxiosDataCreateTerm', array($this, 'slicerCreateTerms'));
        add_action('wp_ajax_processAxiosDataCreateTax', array($this, 'slicerCreateTax'));
        $this->settings();

    }

    public function init()
    {
        add_menu_page('splitCategories', 'Split Categories', 'manage_options', 'splitCategories-plugin', array($this, 'settings_page'));

    }

    function settings()
    {
        register_setting('splitCategories_taxonomy', 'sc_init_taxonomy');

    }

    function create_taxonomy()
    {
        $_taxonomy = get_option('sc_init_taxonomy', true);
        if ($_taxonomy)
            foreach ($_taxonomy as $item) {
                $test = get_taxonomy($item['new']);
                if (!$test) {
                    $this->copyOldTaxonomy($item['old'], $item['new']);
                }
            }
    }

    public function slicerCreateTax()
    {
        if (empty($_POST['body'])) die('Error');
        $data = json_decode(stripslashes($_POST['body']));;
        $oldTax = $data->oldTax;
        $newTax = $data->newTax;

        foreach ($newTax as $key => $taxName) {
            $test = get_taxonomy($taxName);
            $value = [['new' => $taxName, 'old' => $oldTax, 'date' => $data->date, 'newTerms' => $data->newTerms[$key], 'slicerReg' => $data->slicerReg, 'excludedReg' => $data->excludedReg ?: null]];
            if (!$test) {
                $this->copyOldTaxonomy($taxName, $oldTax);
            }
            if (get_option('sc_init_taxonomy', true)) {
                $value = get_option('sc_init_taxonomy', true);

                $value[] = ['new' => $taxName, 'old' => $oldTax, 'date' => $data->date, 'newTerms' => $data->newTerms[$key], 'slicerReg' => $data->slicerReg, 'excludedReg' => $data->excludedReg ?: null];
            }
            $value = array_map('unserialize', array_unique(array_map('serialize', $value)));
            update_option('sc_init_taxonomy', $value);

        }

        die();
    }

    public function slicerCreateTerms()
    {
        if (empty($_POST['body'])) die('Error');
        $data = json_decode(stripslashes($_POST['body']));;
        $newTerm = json_decode(stripslashes($_POST['newTerm']));;
        $oldTax = $data->selectTerm;
        $newTaxonomi = $data->newTermsSetting;

        foreach ($newTerm as $item) {
            if ($item) {
                $taxName = $item->name;
                $tax_name_old = $item->old_term;
                $test = get_taxonomy($taxName);
                if ($test)
                    foreach ($item->terms as $term) {
                        $term_id_old = $term->old_term_id;
                        $term_name = $term->term_name;
                        $old_term = get_term($term_id_old, $tax_name_old);
                        $insert_res = get_term_by('name', $term_name, $taxName);

                        // the parent term is not working, you need a new feature for it to update parent value
                        if (isset($insert_res))
                            $insert_res = wp_insert_term($term_name, $taxName, array(
                                'description' => $old_term->description,
                            ));

                        if (is_wp_error($insert_res)) {
                            $error = $insert_res->get_error_message();
                            die($error);
                        } else {
                            $term_id = $insert_res['term_id'];
                            foreach (has_term_meta($term_id_old) as $meta) {
                                if ($meta && isset($meta['meta_value']))
                                    update_term_meta($term_id, $meta['meta_key'], $meta['meta_value']);
                            }
                            update_term_meta($term_id, 'kw_slicer_term', ['term_id_old' => $term_id_old, 'term_name' => $term_name]);
                            update_term_meta($term_id, 'kw_slicer_term_old_meta', has_term_meta($term_id_old));
                        }
                    }
            }
        }

        die();
    }

    function copyOldTaxonomy($oldTax, $newTax)
    {
        $copy = get_taxonomy($oldTax);

        $label = [];
        if ($copy) {
            foreach ($copy->labels as $key => $l) {
                $label[$key] = str_replace($copy->label, $newTax, $l);
            }

            register_taxonomy(strtolower($newTax), $copy->object_type, [
                'label' => $newTax,
                'labels' => $label,
                'description' => str_replace($copy->label, $newTax, $copy->description),
                'public' => $copy->public,
                'hierarchical' => $copy->hierarchical,
                'show_ui' => $copy->show_ui,
                'show_in_menu' => $copy->show_in_menu,
                'show_in_nav_menus' => $copy->show_in_nav_menus,
                'show_tagcloud' => $copy->show_tagcloud,
                'show_in_quick_edit' => $copy->show_in_quick_edit,
                'show_admin_column' => $copy->show_admin_column,
                'meta_box_cb' => $copy->meta_box_cb,
                'meta_box_sanitize_cb' => $copy->meta_box_sanitize_cb,
                'query_var' => $copy->query_var,

            ]);
        }

    }

    public function settings_page()
    {
        if (get_option('sc_init_taxonomy', true))
            add_option('sc_init_taxonomy', []);

        $all_tax = [];
        $output = 'objects'; // или objects
        $taxonomies = get_taxonomies([], $output);


        foreach ($taxonomies as $term) {
            $terms = get_terms([
                'taxonomy' => $term->name,
                'hide_empty' => false,
            ]);
            if ($terms) {
                $all_tax[$term->name] = (array)$term;
                $all_tax[$term->name]['all_terms'] = (array)$terms;
            }
        }
        wp_enqueue_script('sc_slicer', SC_JS . 'index.js', array(
            'jquery',
        ), time(), true);

        wp_localize_script('sc_slicer', 'app_object', array(
            'ajaxurl' => admin_url('admin-ajax.php'),
            'taxonomy' => $all_tax,
            'old_tax' => get_option('sc_init_taxonomy', true),
        ));
        ?>
        <div id="app"></div>
        <?php    }


}

add_action('plugins_loaded', function () {
    splitCategories::instance();

});
